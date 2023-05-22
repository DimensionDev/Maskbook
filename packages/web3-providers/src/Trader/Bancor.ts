import type { Web3Helper } from '@masknet/web3-helpers'
import {
    getTraderConstants,
    type ChainId,
    isNativeTokenAddress,
    ContractTransaction,
    type SchemaType,
    createContract,
    getTokenConstants,
    isNativeTokenSchemaType,
} from '@masknet/web3-shared-evm'
import { TradeStrategy, type TradeComputed, type TraderAPI } from '../types/Trader.js'
import { ONE, isZero, leftShift, rightShift, ZERO } from '@masknet/web3-shared-base'
import type {
    BancorApiErrorResponse,
    ExpectedTargetAmountResponse,
    SwapBancorRequest,
    TradeTransactionCreationResponse,
} from './types/bancor.js'
import urlcat from 'urlcat'
import { BANCOR_API_BASE_URL } from './constants/bancor.js'
import { fetchJSON } from '../entry-helpers.js'
import { BigNumber } from 'bignumber.js'
import { BIPS_BASE } from './constants/index.js'
import { toChecksumAddress, type AbiItem } from 'web3-utils'
import { pick } from 'lodash-es'
import { Web3API } from '../Connection/index.js'
import { TradeProvider } from '@masknet/public-api'
import WETH_ABI from '@masknet/web3-contracts/abis/WETH.json'
import type { WETH } from '@masknet/web3-contracts/types/WETH.js'

const roundDecimal = (value: number | string | undefined, decimals: number) => {
    return Math.round(Number(value || 0) * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

const calculateMinimumReturn = ({
    toToken,
    toAmount,
    slippage,
}: {
    toToken: Web3Helper.FungibleTokenAll
    toAmount: string | undefined
    slippage: number
}): string => {
    const toWei = rightShift(toAmount || '0', toToken.decimals)
    const slippageWei = new BigNumber(slippage).dividedBy(BIPS_BASE)
    const minReturnWei = toWei.times(ONE.minus(slippageWei))
    return leftShift(minReturnWei, toToken.decimals).toFixed()
}

export class Bancor implements TraderAPI.Provider {
    private Web3 = new Web3API()
    public provider = TradeProvider.BANCOR

    private async swapTransactionBancor(request: SwapBancorRequest) {
        const baseUrl = BANCOR_API_BASE_URL[request.chainId]
        const url = urlcat(baseUrl, '/transactions/swap', {
            source_dlt_type: 'ethereum',
            source_dlt_id: toChecksumAddress(request.fromToken.address),
            target_dlt_type: 'ethereum',
            target_dlt_id: toChecksumAddress(request.toToken.address),
            amount: roundDecimal(request.fromAmount, request.fromToken.decimals),
            min_return: roundDecimal(request.minimumReceived, request.toToken.decimals),
            user_source_dlt_id: request.user,
        })

        return fetchJSON<TradeTransactionCreationResponse>(url)
    }
    private async swapBancor(request: SwapBancorRequest) {
        const baseUrl = BANCOR_API_BASE_URL[request.chainId]
        const { fromToken, toToken, slippage } = request
        const url = urlcat(baseUrl, '/pricing/target-amount', {
            source_dlt_type: 'ethereum',
            source_dlt_id: request.fromToken?.address,
            target_dlt_type: 'ethereum',
            target_dlt_id: request.toToken?.address,
            amount: roundDecimal(request.fromAmount, request.fromToken.decimals),
        })
        const response = await fetchJSON(url)
        const validationErrorResponse = response as BancorApiErrorResponse

        if (validationErrorResponse.error) {
            throw new Error(validationErrorResponse.error?.messages?.[0] || 'Unknown Error')
        }

        const { amount } = response as ExpectedTargetAmountResponse

        const toAmount = amount
        const fromAmount = request.fromAmount
        return {
            ...request,
            toAmount,
            fromAmount,
            minimumReceived: calculateMinimumReturn({ toToken, toAmount, slippage }),
            fromTokenSymbol: fromToken.symbol,
            toTokenSymbol: toToken.symbol,
        }
    }
    private async getTrade(
        chainId: ChainId,
        account: string,
        inputAmount: string,
        slippage: number,
        inputToken?: Web3Helper.FungibleTokenAll,
        outputToken?: Web3Helper.FungibleTokenAll,
    ) {
        const { BANCOR_ETH_ADDRESS } = getTraderConstants(chainId)
        if (!inputToken || !outputToken || isZero(inputAmount) || !BANCOR_ETH_ADDRESS) return null

        const fromToken = isNativeTokenAddress(inputToken.address)
            ? { ...inputToken, address: BANCOR_ETH_ADDRESS }
            : inputToken

        const toToken = isNativeTokenAddress(outputToken.address)
            ? { ...outputToken, address: BANCOR_ETH_ADDRESS }
            : outputToken

        return this.swapBancor({
            strategy: TradeStrategy.ExactIn,
            fromToken,
            toToken,
            fromAmount: leftShift(inputAmount, inputToken.decimals).toFixed(),
            toAmount: '0',
            slippage,
            user: account,
            chainId: chainId as ChainId.Mainnet | ChainId.Ropsten,
            minimumReceived: '0',
        })
    }

    public async getTradeInfo(
        chainId: ChainId,
        account: string,
        inputAmount_: string,
        slippage: number,
        inputToken?: Web3Helper.FungibleTokenAll | undefined,
        outputToken?: Web3Helper.FungibleTokenAll | undefined,
    ) {
        try {
            const trade = await this.getTrade(chainId, account, inputAmount_, slippage, inputToken, outputToken)
            if (!trade) return null
            const inputAmountWei = rightShift(trade.fromAmount || '0', inputToken?.decimals)
            const outputAmountWei = rightShift(trade.toAmount || '0', outputToken?.decimals)
            const minimumReceivedWei = rightShift(trade.minimumReceived, outputToken?.decimals)

            const computed: TradeComputed<SwapBancorRequest> = {
                strategy: TradeStrategy.ExactIn,
                inputToken,
                outputToken,
                inputAmount: inputAmountWei,
                outputAmount: outputAmountWei,
                executionPrice: ZERO,
                fee: ZERO,
                maximumSold: inputAmountWei,
                minimumReceived: minimumReceivedWei,
                priceImpact: ZERO,
                trade_: { ...trade },
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
        const web3 = this.Web3.getWeb3(chainId)
        const tradeAmount = new BigNumber(inputAmount || '0')
        const { WNATIVE_ADDRESS } = getTokenConstants(chainId)
        if (tradeAmount.isZero() || !inputToken || !outputToken || !WNATIVE_ADDRESS) return null

        const wrapperContract = createContract<WETH>(web3, WNATIVE_ADDRESS, WETH_ABI as AbiItem[])

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

    public async getTradeGasLimit(account: string, chainId: ChainId, tradeComputed: TradeComputed<SwapBancorRequest>) {
        if (!account || !tradeComputed?.trade_) return '0'
        const trade = tradeComputed.trade_
        const data = await this.swapTransactionBancor(trade)

        // Note that if approval is required, the API will also return the necessary approval transaction.
        const transaction = data.length === 1 ? data[0] : data[1]

        const config = pick(transaction.transaction, ['to', 'data', 'value', 'from'])

        return this.Web3.estimateTransaction(chainId, config, 0)
    }
}
