import type { Web3Helper } from '@masknet/web3-helpers'
import { ZERO, isZero } from '@masknet/web3-shared-base'
import { CurrencyAmount, type Currency, type Token, type TradeType, type Percent } from '@uniswap/sdk-core'
import {
    computeRealizedLPFeePercent,
    toUniswapCurrency,
    toUniswapCurrencyAmount,
    toUniswapToken,
    uniswapCurrencyAmountTo,
    uniswapPercentTo,
    uniswapPriceTo,
    uniswapTokenTo,
} from './helpers/uniswap.js'
import {
    isValidChainId,
    type ChainId,
    createContract,
    getEthereumConstants,
    ContractTransaction,
    decodeOutputString,
    type UnboxTransactionObject,
} from '@masknet/web3-shared-evm'
import type { TradeProvider } from '@masknet/public-api'
import { chunkArray, getTradeContext, isTradeBetter } from './helpers/trade.js'
import { flatMap, isEmpty } from 'lodash-es'
import { EMPTY_LIST } from '@masknet/shared-base'
import { getPairAddress } from './helpers/pair.js'
import { Web3API } from '../Connection/index.js'
import type { Pair } from '@masknet/web3-contracts/types/Pair.js'
import PairABI from '@masknet/web3-contracts/abis/Pair.json'
import { numberToHex, type AbiItem, type AbiOutput } from 'web3-utils'
import { BETTER_TRADE_LESS_HOPS_THRESHOLD, DEFAULT_GAS_LIMIT, MAX_HOP } from './constants.js'
import { PairState, type Call, type TokenPair, type Trade, TradeStrategy } from './types.js'
import MulticallABI from '@masknet/web3-contracts/abis/Multicall.json'
import type { Multicall } from '@masknet/web3-contracts/types/Multicall.js'
import { Pair as UniSwapPair, Trade as UniSwapTrade } from '@uniswap/v2-sdk'

// [succeed, gasUsed, result]
type Result = [boolean, string, string]

class UniSwapV2Like {
    private Web3 = new Web3API()

    constructor(protected provider: TradeProvider) {}

    private getAllCommonPairs(chainId: ChainId, currencyA?: Currency, currencyB?: Currency) {
        const chainIdValid = isValidChainId(chainId)
        const context = getTradeContext(chainId, this.provider)
        const [tokenA, tokenB] = chainIdValid ? [currencyA?.wrapped, currencyB?.wrapped] : [undefined, undefined]

        if (!tokenA || !tokenB || !context || !context.FACTORY_CONTRACT_ADDRESS || !context.INIT_CODE_HASH)
            return EMPTY_LIST

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
        const web3 = this.Web3.getWeb3(chainId)
        const context = getTradeContext(chainId, this.provider)
        if (!context) return EMPTY_LIST

        const { FACTORY_CONTRACT_ADDRESS, INIT_CODE_HASH } = context

        if (!FACTORY_CONTRACT_ADDRESS || !INIT_CODE_HASH) return EMPTY_LIST

        const listOfPairAddress = tokenPairs.map(([tokenA, tokenB]) =>
            tokenA && tokenB && !tokenA.equals(tokenB)
                ? getPairAddress(FACTORY_CONTRACT_ADDRESS, INIT_CODE_HASH, tokenA, tokenB)
                : undefined,
        )

        const contracts = ([...new Set(listOfPairAddress)].filter(Boolean) as string[])
            .map((address) => createContract(web3, address, PairABI as AbiItem[]))
            .filter(Boolean) as Pair[]

        const names = Array.from<'getReserves'>({ length: contracts.length }).fill('getReserves')

        const calls = contracts.map<Call>((contract, i) => [
            contract.options.address,
            DEFAULT_GAS_LIMIT,
            contract.methods[names[i]]().encodeABI(),
        ])

        const { MULTICALL_ADDRESS } = getEthereumConstants(chainId)

        if (!MULTICALL_ADDRESS) return EMPTY_LIST

        const multiCallContract = createContract<Multicall>(web3, MULTICALL_ADDRESS, MulticallABI as AbiItem[])

        if (isEmpty(calls) || !multiCallContract || !chainId) return

        const chunkResults = await Promise.all(
            chunkArray(calls).map(async (chunk) => {
                const tx = new ContractTransaction(multiCallContract).fill(multiCallContract.methods.multicall(chunk), {
                    chainId: numberToHex(chainId),
                })

                const hex = await this.Web3.callTransaction(chainId, tx, { chainId: numberToHex(chainId) })

                const outputType = multiCallContract.options.jsonInterface.find(
                    ({ name }) => name === 'multicall',
                )?.outputs

                if (!outputType) return EMPTY_LIST

                const decodeResult = decodeOutputString(web3, outputType, hex) as
                    | UnboxTransactionObject<ReturnType<Multicall['methods']['multicall']>>
                    | undefined

                if (!decodeResult) return EMPTY_LIST

                return decodeResult.returnData
            }),
        )

        const results = flatMap<Result>(chunkResults).map(([succeed, gasUsed, result], index) => {
            const outputs: AbiOutput[] =
                contracts[index].options.jsonInterface.find(
                    ({ type, name }) => type === 'function' && name === names[index],
                )?.outputs ?? []

            try {
                const value = decodeOutputString(web3, outputs, result)

                return { succeed, gasUsed, value, error: null }
            } catch (error) {
                return { succeed: false, gasUsed, value: null, error }
            }
        })

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
        currencyAmountIn?: CurrencyAmount<Currency>,
        currencyOut?: Currency,
    ) {
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

    public getTradeComputed(
        trade: Trade | null,
        slippage: Percent,
        inputToken?: Web3Helper.FungibleTokenAll,
        outputToken?: Web3Helper.FungibleTokenAll,
    ) {
        if (!trade) return null

        const realizedLPFeePercent = computeRealizedLPFeePercent(trade)
        const realizedLPFee = trade.inputAmount.multiply(realizedLPFeePercent)
        const priceImpact = trade.priceImpact.subtract(realizedLPFeePercent)

        return {
            strategy: TradeStrategy.ExactIn,
            inputToken,
            outputToken,
            inputAmount: uniswapCurrencyAmountTo(trade.inputAmount),
            outputAmount: uniswapCurrencyAmountTo(trade.outputAmount),
            executionPrice: uniswapPriceTo(trade.executionPrice),
            priceImpact: uniswapPercentTo(priceImpact ?? trade.priceImpact),
            path: trade instanceof UniSwapTrade ? trade.route.path.map((x) => [uniswapTokenTo(x)]) : [],
            maximumSold: uniswapCurrencyAmountTo(trade.maximumAmountIn(slippage)),
            minimumReceived: uniswapCurrencyAmountTo(trade.minimumAmountOut(slippage)),
            fee: realizedLPFee ? uniswapCurrencyAmountTo(realizedLPFee) : ZERO,
            trade_: trade,
        }
    }
}
