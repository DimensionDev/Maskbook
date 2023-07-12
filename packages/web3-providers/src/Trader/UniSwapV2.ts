import { toHex } from 'web3-utils'
import { flatMap, compact } from 'lodash-es'
import { BigNumber } from 'bignumber.js'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ZERO, isZero, toFixed } from '@masknet/web3-shared-base'
import { CurrencyAmount, type Currency, type Token, TradeType, Percent } from '@uniswap/sdk-core'
import { Pair as UniSwapPair, Trade as UniSwapTrade } from '@uniswap/v2-sdk'
import { SwapRouter as V3Router } from '@uniswap/v3-sdk'
import {
    isValidChainId,
    ChainId,
    isNativeTokenSchemaType,
    type SchemaType,
    getTokenConstants,
    ContractTransaction,
} from '@masknet/web3-shared-evm'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { TradeProvider } from '@masknet/public-api'
import { getTradeContext, isTradeBetter } from './helpers/trade.js'
import { getPairAddress } from './helpers/pair.js'
import { MulticallAPI } from '../Multicall/index.js'
import { ConnectionReadonlyAPI } from '../Web3/EVM/apis/ConnectionReadonlyAPI.js'
import { ContractReadonlyAPI } from '../Web3/EVM/apis/ContractReadonlyAPI.js'
import {
    BETTER_TRADE_LESS_HOPS_THRESHOLD,
    DEFAULT_TRANSACTION_DEADLINE,
    L2_TRANSACTION_DEADLINE,
    MAX_HOP,
    SLIPPAGE_DEFAULT,
    UNISWAP_BIPS_BASE,
} from './constants/index.js'
import {
    computeRealizedLPFeePercent,
    swapCallParameters,
    swapErrorToUserReadableMessage,
    toUniswapCurrency,
    toUniswapCurrencyAmount,
    toUniswapPercent,
    toUniswapToken,
    uniswapCurrencyAmountTo,
    uniswapPercentTo,
    uniswapPriceTo,
    uniswapTokenTo,
} from './helpers/uniswap.js'
import {
    PairState,
    type TokenPair,
    type Trade,
    TradeStrategy,
    type TradeComputed,
    type SwapCallEstimate,
    type SuccessfulCall,
    type FailedCall,
    type TraderAPI,
} from '../types/Trader.js'

export class UniSwapV2Like implements TraderAPI.Provider {
    public Web3 = new ConnectionReadonlyAPI()
    public Contract = new ContractReadonlyAPI()
    public Multicall = new MulticallAPI()

    constructor(public provider: TradeProvider) {}

    public getAllCommonPairs(chainId: ChainId, currencyA?: Currency, currencyB?: Currency) {
        const chainIdValid = isValidChainId(chainId)
        const context = getTradeContext(chainId, this.provider)
        const [tokenA, tokenB] = chainIdValid ? [currencyA?.wrapped, currencyB?.wrapped] : [undefined, undefined]

        if (!tokenA || !tokenB || !context?.FACTORY_CONTRACT_ADDRESS || !context.INIT_CODE_HASH) return EMPTY_LIST

        const bases: Token[] = !chainIdValid
            ? []
            : [
                  ...(context?.AGAINST_TOKENS?.[chainId] ?? []),
                  ...(tokenA ? context?.ADDITIONAL_TOKENS?.[chainId]?.[tokenA.address] ?? [] : []),
                  ...(tokenB ? context?.ADDITIONAL_TOKENS?.[chainId]?.[tokenB.address] ?? [] : []),
              ].map((x) => toUniswapToken(chainId, x))

        const basePairs: Array<[Token, Token]> = flatMap(
            bases,
            (base): Array<[Token, Token]> => bases.map((otherBase) => [base, otherBase]),
        )

        return [
            // the direct pair
            [tokenA, tokenB],
            // token A against all bases
            ...bases.map((base): [Token, Token] => [tokenA, base]),
            // token B against all bases
            ...bases.map((base): [Token, Token] => [tokenB, base]),
            // each base against all bases
            ...basePairs,
        ]
            .filter((tokens): tokens is [Token, Token] => !!(tokens[0] && tokens[1]))
            .filter(([t0, t1]) => t0.address !== t1.address)
            .filter(([tokenA, tokenB]) => {
                if (!chainIdValid) return true
                const customBases = context?.CUSTOM_TOKENS?.[chainId as ChainId]

                const customBasesA: Token[] | undefined = customBases?.[tokenA.address]?.map((x) =>
                    toUniswapToken(chainId as ChainId, x),
                )
                const customBasesB: Token[] | undefined = customBases?.[tokenB.address]?.map((x) =>
                    toUniswapToken(chainId as ChainId, x),
                )

                if (!customBasesA && !customBasesB) return true

                if (customBasesA && !customBasesA.find((base) => tokenB.equals(base))) return false
                if (customBasesB && !customBasesB.find((base) => tokenA.equals(base))) return false

                return true
            })
    }

    private async getPairs(chainId: ChainId, tokenPairs: readonly TokenPair[]) {
        const context = getTradeContext(chainId, this.provider)
        if (!context) return EMPTY_LIST

        const { FACTORY_CONTRACT_ADDRESS, INIT_CODE_HASH } = context

        if (!FACTORY_CONTRACT_ADDRESS || !INIT_CODE_HASH) return EMPTY_LIST

        const listOfPairAddress = tokenPairs.map(([tokenA, tokenB]) =>
            tokenA && tokenB && !tokenA.equals(tokenB)
                ? getPairAddress(FACTORY_CONTRACT_ADDRESS, INIT_CODE_HASH, tokenA, tokenB)
                : undefined,
        )

        const contracts = compact(
            compact([...new Set(listOfPairAddress)]).map((address) =>
                this.Contract.getPairContract(address, { chainId }),
            ),
        )

        const names = Array.from<'getReserves'>({ length: contracts.length }).fill('getReserves')

        const calls = this.Multicall.createMultipleContractSingleData(contracts, names, [])
        const results = await this.Multicall.call(chainId, contracts, names, calls)

        if (!results) return EMPTY_LIST

        type ReserveResult = {
            id: string
            reserve0: string
            reserve1: string
        }

        // compose reserves from multicall results
        const listOfReserves = results
            .map((x, i): ReserveResult | undefined => {
                if (x.error || !x.value) return undefined
                return {
                    id: contracts[i].options.address,
                    reserve0: x.value._reserve0,
                    reserve1: x.value._reserve1,
                }
            })
            .filter((value): value is ReserveResult => value !== undefined)

        return listOfPairAddress.map((address, i) => {
            try {
                const tokenA = tokenPairs[i][0]
                const tokenB = tokenPairs[i][1]
                if (!tokenA || !tokenB || tokenA.equals(tokenB)) return [PairState.INVALID, null]
                const { reserve0, reserve1 } =
                    listOfReserves.find((x) => x.id.toLowerCase() === address?.toLowerCase()) ?? {}
                if (!reserve0 || !reserve1) return [PairState.NOT_EXISTS, null]
                const [token0, token1] = tokenA.sortsBefore(tokenB) ? [tokenA, tokenB] : [tokenB, tokenA]
                return [
                    PairState.EXISTS,
                    new UniSwapPair(
                        CurrencyAmount.fromRawAmount(token0, reserve0),
                        CurrencyAmount.fromRawAmount(token1, reserve1),
                    ),
                ] as const
            } catch {
                return []
            }
        })
    }

    private async getSwapParameters(
        chainId: ChainId,
        account: string,
        trade: TradeComputed<Trade> | null,
        allowedSlippage: number = SLIPPAGE_DEFAULT,
    ) {
        const context = getTradeContext(chainId, this.provider)
        const timestamp = await this.Web3.getBlockTimestamp({ chainId })
        const timestamp_ = new BigNumber(timestamp ?? '0')
        const deadline = timestamp_.plus(
            chainId === ChainId.Mainnet ? DEFAULT_TRANSACTION_DEADLINE : L2_TRANSACTION_DEADLINE,
        )

        const routerV2Contract = this.Contract.getRouterV2Contract(context?.ROUTER_CONTRACT_ADDRESS, { chainId })
        const swapRouterContract = this.Contract.getSwapRouterContract(context?.ROUTER_CONTRACT_ADDRESS, {
            chainId,
        })

        if (!trade?.trade_) return []

        const { trade_ } = trade
        const allowedSlippage_ = new Percent(allowedSlippage, UNISWAP_BIPS_BASE)
        if (trade_ instanceof UniSwapTrade) {
            if (!routerV2Contract) return []
            const parameters = [
                swapCallParameters(
                    trade_,
                    {
                        feeOnTransfer: false,
                        allowedSlippage: allowedSlippage_,
                        recipient: account,
                        ttl: deadline.toNumber(),
                    },
                    this.provider,
                ),
            ]
            if (trade_.tradeType === TradeType.EXACT_INPUT)
                parameters.push(
                    swapCallParameters(
                        trade_,
                        {
                            feeOnTransfer: true,
                            allowedSlippage: allowedSlippage_,
                            recipient: account,
                            ttl: deadline.toNumber(),
                        },
                        this.provider,
                    ),
                )
            return parameters.map(({ methodName, args, value }) => {
                return {
                    address: routerV2Contract.options.address,
                    calldata: routerV2Contract.methods[methodName as keyof typeof routerV2Contract.methods](
                        // @ts-expect-error unsafe call
                        ...args,
                    ).encodeABI(),
                    value,
                }
            })
        } else {
            if (!swapRouterContract) return []
            const { value, calldata } = V3Router.swapCallParameters(trade_, {
                recipient: account,
                slippageTolerance: allowedSlippage_,
                deadline: deadline.toNumber(),
            })
            return [
                {
                    address: swapRouterContract.options.address,
                    calldata,
                    value,
                },
            ]
        }
    }

    public getTrade(
        inputAmount: string,
        chainId?: ChainId,
        inputToken?: Web3Helper.FungibleTokenAll,
        outputToken?: Web3Helper.FungibleTokenAll,
    ) {
        const isTradable = !isZero(inputAmount)
        const isNotAvailable = !isTradable || !inputToken || !outputToken
        const inputCurrency = toUniswapCurrency(chainId, inputToken)
        const outputCurrency = toUniswapCurrency(chainId, outputToken)
        const tradeAmount = toUniswapCurrencyAmount(chainId, inputToken, inputAmount)

        return {
            isNotAvailable,
            tradeAmount,
            inputCurrency,
            outputCurrency,
        }
    }

    public async getBestTradeExactIn(
        chainId: ChainId,
        currencyAmountIn: CurrencyAmount<Currency>,
        currencyOut: Currency,
    ): Promise<Trade | null> {
        const currencyA = currencyAmountIn?.currency
        const currencyB = currencyOut

        const allCurrencyCombinations = this.getAllCommonPairs(chainId, currencyA, currencyB)

        const allPairs = await this.getPairs(chainId, allCurrencyCombinations)

        const filtered = new Map<string, UniSwapPair>()

        for (const [state, pair] of allPairs as Array<[PairState.EXISTS, UniSwapPair]>) {
            // filter out invalid pairs
            if (state !== PairState.EXISTS) continue
            if (!pair) continue
            // filter out duplicated pairs
            const { address } = pair.liquidityToken
            if (filtered.has(address)) continue
            filtered.set(pair.liquidityToken.address, pair)
        }

        const allowedPairs = [...filtered.values()]

        if (currencyAmountIn && currencyOut && allowedPairs.length > 0) {
            let bestTradeSoFar: UniSwapTrade<Currency, Currency, TradeType.EXACT_INPUT> | null = null

            for (let i = 1; i <= MAX_HOP; i += 1) {
                const currentTrade: UniSwapTrade<Currency, Currency, TradeType.EXACT_INPUT> | null =
                    UniSwapTrade.bestTradeExactIn(allowedPairs, currencyAmountIn, currencyOut, {
                        maxHops: i,
                        maxNumResults: 1,
                    })[0] ?? null
                // if current trade is best yet, save it
                if (isTradeBetter(bestTradeSoFar, currentTrade, BETTER_TRADE_LESS_HOPS_THRESHOLD)) {
                    bestTradeSoFar = currentTrade
                }
            }

            return bestTradeSoFar
        }

        return null
    }

    public async getTradeInfo(
        chainId: ChainId,
        account: string,
        inputAmount_: string,
        slippage: number,
        inputToken?: Web3Helper.FungibleTokenAll,
        outputToken?: Web3Helper.FungibleTokenAll,
    ) {
        try {
            const { isNotAvailable, tradeAmount, outputCurrency } = this.getTrade(
                inputAmount_,
                chainId,
                inputToken,
                outputToken,
            )

            if (isNotAvailable || !tradeAmount || !outputCurrency) return null

            const trade = await this.getBestTradeExactIn(chainId, tradeAmount, outputCurrency)
            if (!trade) return null

            const realizedLPFeePercent = computeRealizedLPFeePercent(trade)
            const realizedLPFee = trade.inputAmount.multiply(realizedLPFeePercent)
            const priceImpact = trade.priceImpact.subtract(realizedLPFeePercent)

            const percent_ = toUniswapPercent(slippage, 10000)
            const computed = {
                strategy: TradeStrategy.ExactIn,
                inputToken,
                outputToken,
                inputAmount: uniswapCurrencyAmountTo(trade.inputAmount),
                outputAmount: uniswapCurrencyAmountTo(trade.outputAmount),
                executionPrice: uniswapPriceTo(trade.executionPrice),
                priceImpact: uniswapPercentTo(priceImpact ?? trade.priceImpact),
                path: trade instanceof UniSwapTrade ? trade.route.path.map((x) => [uniswapTokenTo(x)]) : [],
                maximumSold: uniswapCurrencyAmountTo(trade.maximumAmountIn(percent_)),
                minimumReceived: uniswapCurrencyAmountTo(trade.minimumAmountOut(percent_)),
                fee: realizedLPFee ? uniswapCurrencyAmountTo(realizedLPFee) : ZERO,
                trade_: trade,
            }

            try {
                const gas = await this.getTradeGasLimit(account, chainId, computed)
                return {
                    gas,
                    value: computed,
                    provider: this.provider,
                }
            } catch {
                return {
                    value: computed,
                    provider: this.provider,
                }
            }
        } catch (error) {
            if (error instanceof Error) {
                return {
                    value: null,
                    error,
                    provider: this.provider,
                }
            }
            return null
        }
    }

    public async getNativeWrapperTradeInfo(
        chainId: ChainId,
        account: string,
        inputAmount: string,
        inputToken?: Web3Helper.FungibleTokenAll,
        outputToken?: Web3Helper.FungibleTokenAll,
    ) {
        const { WNATIVE_ADDRESS } = getTokenConstants(chainId)
        const tradeAmount = new BigNumber(inputAmount || '0')
        if (tradeAmount.isZero() || !inputToken || !outputToken || !WNATIVE_ADDRESS) return null

        const wrapperContract = this.Contract.getWETHContract(WNATIVE_ADDRESS, { chainId })

        const computed = {
            strategy: TradeStrategy.ExactIn,
            inputToken,
            outputToken,
            inputAmount: tradeAmount,
            outputAmount: tradeAmount,
            executionPrice: ZERO,
            maximumSold: ZERO,
            minimumReceived: tradeAmount,
            priceImpact: ZERO,
            fee: ZERO,
            trade_: {
                isWrap: isNativeTokenSchemaType(inputToken.schema as SchemaType),
                isNativeTokenWrapper: true,
            },
        }

        try {
            const tx = await new ContractTransaction(wrapperContract).fillAll(wrapperContract?.methods.deposit(), {
                from: account,
                value: tradeAmount.toFixed(),
            })

            const gas = tx.gas ?? '0'

            return {
                gas,
                provider: this.provider,
                value: computed,
            }
        } catch {
            return {
                value: computed,
                provider: this.provider,
            }
        }
    }

    public async getTradeGasLimit(account: string, chainId: ChainId, trade: TradeComputed<Trade> | null) {
        const tradeParameters = await this.getSwapParameters(chainId, account, trade)

        // step 1: estimate each trade parameter
        const estimatedCalls: SwapCallEstimate[] = await Promise.all(
            tradeParameters.map(async (x) => {
                const { address, calldata, value } = x
                const config = {
                    from: account,
                    to: address,
                    data: calldata,
                    ...(!value || /^0x0*$/.test(value) ? {} : { value: toHex(value) }),
                }

                try {
                    const gas = await this.Web3.estimateTransaction(config, 0, { chainId })
                    return {
                        call: x,
                        gasEstimate: gas ?? '0',
                    }
                } catch (error) {
                    return this.Web3.callTransaction(config, { chainId })
                        .then(() => {
                            return {
                                call: x,
                                error: new Error('Gas estimate failed'),
                            }
                        })
                        .catch((error) => {
                            return {
                                call: x,
                                error: new Error(swapErrorToUserReadableMessage(error)),
                            }
                        })
                }
            }),
        )

        // a successful estimation is a bignumber gas estimate and the next call is also a bignumber gas estimate
        let bestCallOption: SuccessfulCall | SwapCallEstimate | undefined = estimatedCalls.find(
            (el, ix, list): el is SuccessfulCall =>
                'gasEstimate' in el && (ix === list.length - 1 || 'gasEstimate' in list[ix + 1]),
        )

        // check if any calls errored with a recognizable error
        if (!bestCallOption) {
            const errorCalls = estimatedCalls.filter((call): call is FailedCall => 'error' in call)
            if (errorCalls.length > 0) {
                return
            }
            const firstNoErrorCall = estimatedCalls.find((call): call is SwapCallEstimate => !('error' in call))
            if (!firstNoErrorCall) {
                return
            }
            bestCallOption = firstNoErrorCall
        }

        return 'gasEstimate' in bestCallOption ? toFixed(bestCallOption.gasEstimate) : '0'
    }
}
