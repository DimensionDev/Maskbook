import urlcat from 'urlcat'
import { TradeProvider } from '@masknet/public-api'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { ChainId } from '@masknet/web3-shared-evm'
import { leftShift } from '@masknet/web3-shared-base'
import type { TraderAPI } from '@masknet/web3-providers/types'
import { fetchJSON } from '@masknet/web3-providers/helpers'
import type {
    SwapRouteRequest,
    SwapRouteResponse,
    SwapRouteErrorResponse,
    SwapRouteSuccessResponse,
    SwapRouteData,
} from '../types/index.js'

const DODO_BASE_URL = 'https://dodoex.r2d2.to'

export class DodoAPI implements TraderAPI.Provider {
    get provider() {
        return TradeProvider.DODO
    }

    async swapRoute(request: SwapRouteRequest) {
        const payload = await fetchJSON<SwapRouteResponse>(
            // cspell:disable-next-line
            urlcat(DODO_BASE_URL, '/dodoapi/getdodoroute', {
                chainId: request.chainId,
                slippage: request.slippage,
                fromTokenAddress: request.fromToken?.address,
                fromTokenDecimals: request.fromToken.decimals,
                toTokenAddress: request.toToken?.address,
                toTokenDecimals: request.toToken.decimals,
                fromAmount: request.fromAmount,
                userAddr: request.userAddr,
                rpc: request.rpc,
            }),
        )

        if (payload.status !== 200) {
            throw new Error((payload as SwapRouteErrorResponse).data ?? 'Unknown Error')
        }

        return {
            ...(payload as SwapRouteSuccessResponse).data,
            fromAmount: leftShift(request.fromAmount, request.fromToken.decimals).toNumber(),
            value: request.isNativeSellToken ? request.fromAmount : '0',
            slippage: request.slippage,
            fromTokenSymbol: request.fromToken.symbol,
            toTokenSymbol: request.toToken.symbol,
        } as SwapRouteData
    }

    getTradeInfo(
        chainId: ChainId,
        account: string,
        inputAmount_: string,
        slippage: number,
        inputToken?: Web3Helper.FungibleTokenAll | undefined,
        outputToken?: Web3Helper.FungibleTokenAll | undefined,
    ): Promise<TraderAPI.TradeInfo> {
        throw new Error('')
    }

    getNativeWrapperTradeInfo(
        chainId: ChainId,
        account: string,
        inputAmount: string,
        inputToken?: Web3Helper.FungibleTokenAll | undefined,
        outputToken?: Web3Helper.FungibleTokenAll | undefined,
    ): Promise<TraderAPI.TradeInfo> {
        throw new Error('')
    }
}
