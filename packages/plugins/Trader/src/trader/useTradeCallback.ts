import { noop } from 'lodash-es'
import type { AsyncFnReturn } from 'react-use/lib/useAsyncFn.js'
import type { Trade as V2Trade } from '@uniswap/v2-sdk'
import type { Trade as V3Trade } from '@uniswap/v3-sdk'
import type { Currency, TradeType } from '@uniswap/sdk-core'
import { unreachable } from '@masknet/kit'
import { TradeProvider } from '@masknet/public-api'
import type { ChainId, GasConfig } from '@masknet/web3-shared-evm'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import { NetworkPluginID } from '@masknet/shared-base'
import type { TraderAPI } from '@masknet/web3-providers/types'
import { useTradeCallback as useNativeTokenWrapperCallback } from './native/useTradeCallback.js'
import { useTradeCallback as useZrxCallback } from './0x/useTradeCallback.js'
import { useTradeCallback as useUniswapCallback } from './uniswap/useTradeCallback.js'
import { useTradeCallback as useDODOCallback } from './dodo/useTradeCallback.js'
import { useTradeCallback as useBancorCallback } from './bancor/useTradeCallback.js'
import { useTradeCallback as useOpenOceanCallback } from './openocean/useTradeCallback.js'
import type { NativeTokenWrapper } from './native/useTradeComputed.js'
import { useGetTradeContext } from './useGetTradeContext.js'
import { isNativeTokenWrapper } from '../helpers/index.js'
import type {
    SwapQuoteResponse,
    SwapBancorRequest,
    SwapRouteSuccessResponse,
    SwapOOSuccessResponse,
} from '../types/index.js'

export function useTradeCallback(
    provider?: TradeProvider,
    tradeComputed?: TraderAPI.TradeComputed | null,
    gasConfig?: GasConfig,
    allowedSlippage?: number,
): AsyncFnReturn<() => Promise<string | undefined>> {
    // trade context
    const context = useGetTradeContext(provider)
    const { chainId } = useChainContext()
    const { pluginID } = useNetworkContext()
    // create trade computed
    const isNativeTokenWrapper_ = isNativeTokenWrapper(tradeComputed ?? null)
    const tradeComputedForUniswapV2Like =
        context?.IS_UNISWAP_V2_LIKE && !isNativeTokenWrapper_
            ? (tradeComputed as TraderAPI.TradeComputed<V2Trade<Currency, Currency, TradeType>>)
            : null
    const tradeComputedForUniswapV3Like =
        context?.IS_UNISWAP_V3_LIKE && !isNativeTokenWrapper_
            ? (tradeComputed as TraderAPI.TradeComputed<V3Trade<Currency, Currency, TradeType>>)
            : null
    const tradeComputedForZRX = !isNativeTokenWrapper_
        ? (tradeComputed as TraderAPI.TradeComputed<SwapQuoteResponse>)
        : null
    const tradeComputedForDODO = !isNativeTokenWrapper_
        ? (tradeComputed as TraderAPI.TradeComputed<SwapRouteSuccessResponse>)
        : null
    const tradeComputedForBancor = !isNativeTokenWrapper_
        ? (tradeComputed as TraderAPI.TradeComputed<SwapBancorRequest>)
        : null
    const tradeComputedForOpenOcean = !isNativeTokenWrapper_
        ? (tradeComputed as TraderAPI.TradeComputed<SwapOOSuccessResponse>)
        : null
    // uniswap like providers
    const uniswapV2Like = useUniswapCallback(tradeComputedForUniswapV2Like, provider, gasConfig, allowedSlippage)
    const uniswapV3Like = useUniswapCallback(tradeComputedForUniswapV3Like, provider, gasConfig, allowedSlippage)

    // other providers
    const zrx = useZrxCallback(provider === TradeProvider.ZRX ? tradeComputedForZRX : null, gasConfig)
    const dodo = useDODOCallback(provider === TradeProvider.DODO ? tradeComputedForDODO : null, gasConfig)
    const bancor = useBancorCallback(provider === TradeProvider.BANCOR ? tradeComputedForBancor : null, gasConfig)
    const openocean = useOpenOceanCallback(
        provider === TradeProvider.OPENOCEAN ? tradeComputedForOpenOcean : null,
        gasConfig,
    )

    // the trade is an ETH-WETH pair
    const nativeTokenWrapper = useNativeTokenWrapperCallback(
        tradeComputed as TraderAPI.TradeComputed<NativeTokenWrapper>,
        gasConfig,
        pluginID === NetworkPluginID.PLUGIN_EVM ? (chainId as ChainId) : undefined,
    )
    if (isNativeTokenWrapper_) return nativeTokenWrapper

    // handle trades by various provider
    switch (provider) {
        case TradeProvider.UNISWAP_V2:
            return uniswapV2Like
        case TradeProvider.UNISWAP_V3:
            return uniswapV3Like
        case TradeProvider.SUSHISWAP:
            return uniswapV2Like
        case TradeProvider.QUICKSWAP:
            return uniswapV2Like
        case TradeProvider.PANCAKESWAP:
            return uniswapV2Like
        case TradeProvider.WANNASWAP:
            return uniswapV2Like
        case TradeProvider.TRISOLARIS:
            return uniswapV2Like
        case TradeProvider.MDEX:
            return uniswapV2Like
        case TradeProvider.ARTHSWAP:
            return uniswapV2Like
        case TradeProvider.VERSA:
            return uniswapV2Like
        case TradeProvider.ASTAREXCHANGE:
            return uniswapV2Like
        case TradeProvider.YUMISWAP:
            return uniswapV2Like
        case TradeProvider.ZRX:
            return zrx
        case TradeProvider.DODO:
            return dodo
        case TradeProvider.BANCOR:
            return bancor
        case TradeProvider.TRADERJOE:
            return uniswapV2Like
        case TradeProvider.PANGOLIN:
            return uniswapV2Like
        case TradeProvider.OPENOCEAN:
            return openocean
        default:
            if (provider) unreachable(provider)
            return [{ loading: false }, noop as () => Promise<undefined>] as AsyncFnReturn<
                () => Promise<string | undefined>
            >
    }
}
