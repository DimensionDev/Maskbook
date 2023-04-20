import { NetworkType, chainResolver, isNativeTokenAddress, type ChainId } from '@masknet/web3-shared-evm'
import { TradeStrategy, type TradeComputed, type TraderAPI } from '../types/Trader.js'
import type { Web3Helper } from '@masknet/web3-helpers'
import { ZERO, isZero } from '@masknet/web3-shared-base'
import { safeUnreachable } from '@masknet/kit'
import { BigNumber } from 'bignumber.js'

import { fetchJSON } from '../entry-helpers.js'
import urlcat from 'urlcat'
import type {
    SwapErrorResponse,
    SwapQuoteRequest,
    SwapQuoteResponse,
    SwapServerErrorResponse,
    SwapValidationErrorResponse,
} from './types/0x.js'
import { BIPS_BASE } from './constants/index.js'
import { first, pick } from 'lodash-es'
import { ZRX_AFFILIATE_ADDRESS, ZRX_BASE_URL } from './constants/0x.js'
import { Web3API } from '../Connection/index.js'
import { TradeProvider } from '@masknet/public-api'

const NATIVE_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export function getNativeTokenLabel(networkType: NetworkType) {
    switch (networkType) {
        case NetworkType.Ethereum:
            return 'ETH'
        case NetworkType.Binance:
        case NetworkType.Polygon:
        case NetworkType.Arbitrum:
        case NetworkType.xDai:
        case NetworkType.Celo:
        case NetworkType.Fantom:
        case NetworkType.Aurora:
        case NetworkType.Boba:
        case NetworkType.Fuse:
        case NetworkType.Metis:
        case NetworkType.Avalanche:
        case NetworkType.Optimism:
        case NetworkType.Conflux:
        case NetworkType.Astar:
        case NetworkType.Moonbeam:
            return NATIVE_TOKEN_ADDRESS
        default:
            safeUnreachable(networkType)
            return ''
    }
}

export class Zrx implements TraderAPI.Provider {
    private Web3 = new Web3API()
    private provider = TradeProvider.ZRX

    private async swapQuote(request: SwapQuoteRequest, networkType: NetworkType) {
        const params: Record<string, string | number> = {}
        Object.entries(request).map(([key, value]) => {
            params[key] = value
        })
        if (request.slippagePercentage)
            params.slippagePercentage = new BigNumber(request.slippagePercentage).dividedBy(BIPS_BASE).toFixed()
        if (request.buyTokenPercentageFee)
            params.buyTokenPercentageFee = new BigNumber(request.buyTokenPercentageFee).dividedBy(100).toFixed()

        const response_ = await fetchJSON<SwapQuoteResponse | SwapErrorResponse>(
            urlcat(ZRX_BASE_URL[networkType], 'swap/v1/quote', params),
        )

        const validationErrorResponse = response_ as SwapValidationErrorResponse
        if (validationErrorResponse.code)
            throw new Error(first(validationErrorResponse.validationErrors)?.reason ?? 'Unknown Error')

        const serverErrorResponse = response_ as SwapServerErrorResponse
        if (serverErrorResponse.reason)
            throw new Error(first(validationErrorResponse.validationErrors)?.reason || 'Unknown Error')

        const successResponse = response_ as SwapQuoteResponse
        return successResponse
    }

    private async getTrade(
        chainId: ChainId,
        account: string,
        inputAmount: string,
        slippage: number,
        inputToken?: Web3Helper.FungibleTokenAll,
        outputToken?: Web3Helper.FungibleTokenAll,
    ) {
        if (isZero(inputAmount) || !inputToken || !outputToken) return null

        const networkType = chainResolver.networkType(chainId as ChainId)

        if (!networkType) return
        const sellToken = isNativeTokenAddress(inputToken.address)
            ? getNativeTokenLabel(networkType)
            : inputToken.address

        const buyToken = isNativeTokenAddress(outputToken.address)
            ? getNativeTokenLabel(networkType)
            : outputToken.address

        return this.swapQuote(
            {
                sellToken,
                buyToken,
                takerAddress: account,
                sellAmount: inputAmount,
                buyAmount: void 0,
                skipValidation: true,
                slippagePercentage: slippage,
                affiliateAddress: ZRX_AFFILIATE_ADDRESS,
            },
            networkType,
        )
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
            const trade = await this.getTrade(chainId, account, inputAmount_, slippage, inputToken, outputToken)
            if (!trade) return null

            const inputAmount = new BigNumber(trade.sellAmount)
            const outputAmount = new BigNumber(trade.buyAmount)

            const computed = {
                strategy: TradeStrategy.ExactIn,
                inputToken,
                outputToken,
                inputAmount,
                outputAmount,
                executionPrice: new BigNumber(trade.price),
                fee: new BigNumber(trade.minimumProtocolFee),
                maximumSold: new BigNumber(trade.sellAmount),
                minimumReceived: outputAmount,

                // minimumProtocolFee
                priceImpact: ZERO,

                trade_: { ...trade, buyAmount: outputAmount.toFixed() },
            } as TradeComputed<SwapQuoteResponse>

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

    public async getTradeGasLimit(account: string, chainId: ChainId, trade: TradeComputed<SwapQuoteResponse>) {
        if (!account || !trade.trade_) return '0'

        const config = {
            from: account,
            ...pick(trade.trade_, 'to', 'data', 'value'),
        }

        return this.Web3.estimateTransaction(chainId, config, 0)
    }
}
