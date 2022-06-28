import type { Trade as V2Trade } from '@uniswap/v2-sdk'
import type { Trade as V3Trade } from '@uniswap/v3-sdk'
import type { Currency, TradeType } from '@uniswap/sdk-core'
import { unreachable } from '@dimensiondev/kit'
import { TradeProvider } from '@masknet/public-api'
import type {
    SwapQuoteResponse,
    SwapResponse,
    SwapBancorRequest,
    SwapRouteSuccessResponse,
    TradeComputed,
    SwapOOSuccessResponse,
} from '../types'
import { useTradeCallback as useNativeTokenWrapperCallback } from './native/useTradeCallback'
import { useTradeCallback as useZrxCallback } from './0x/useTradeCallback'
import { useTradeCallback as useUniswapCallback } from './uniswap/useTradeCallback'
import { useTradeCallback as useBalancerCallback } from './balancer/useTradeCallback'
import { useTradeCallback as useDODOCallback } from './dodo/useTradeCallback'
import { useTradeCallback as useBancorCallback } from './bancor/useTradeCallback'
import { useTradeCallback as useOpenOceanCallback } from './openocean/useTradeCallback'
import { useExchangeProxyContract } from '../contracts/balancer/useExchangeProxyContract'
import type { NativeTokenWrapper } from './native/useTradeComputed'
import { isNativeTokenWrapper } from '../helpers'
import { useGetTradeContext } from './useGetTradeContext'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'
import type { GasOptionConfig } from '@masknet/web3-shared-evm'
import { noop } from 'lodash-unified'
import type { AsyncFnReturn } from 'react-use/lib/useAsyncFn'

export function useTradeCallback(
    provider?: TradeProvider,
    tradeComputed?: TradeComputed<unknown> | null,
    gasConfig?: GasOptionConfig,
    allowedSlippage?: number,
): AsyncFnReturn<() => Promise<string | undefined>> {
    // trade context
    const context = useGetTradeContext(provider)
    const { targetChainId } = TargetChainIdContext.useContainer()
    // create trade computed
    const isNativeTokenWrapper_ = isNativeTokenWrapper(tradeComputed ?? null)
    const tradeComputedForUniswapV2Like =
        context?.IS_UNISWAP_V2_LIKE && !isNativeTokenWrapper_
            ? (tradeComputed as TradeComputed<V2Trade<Currency, Currency, TradeType>>)
            : null
    const tradeComputedForUniswapV3Like =
        context?.IS_UNISWAP_V3_LIKE && !isNativeTokenWrapper_
            ? (tradeComputed as TradeComputed<V3Trade<Currency, Currency, TradeType>>)
            : null
    const tradeComputedForZRX = !isNativeTokenWrapper_ ? (tradeComputed as TradeComputed<SwapQuoteResponse>) : null
    const tradeComputedForBalancer = !isNativeTokenWrapper_ ? (tradeComputed as TradeComputed<SwapResponse>) : null
    const tradeComputedForDODO = !isNativeTokenWrapper_
        ? (tradeComputed as TradeComputed<SwapRouteSuccessResponse>)
        : null
    const tradeComputedForBancor = !isNativeTokenWrapper_ ? (tradeComputed as TradeComputed<SwapBancorRequest>) : null
    const tradeComputedForOpenOcean = !isNativeTokenWrapper_
        ? (tradeComputed as TradeComputed<SwapOOSuccessResponse>)
        : null
    // uniswap like providers
    const uniswapV2Like = useUniswapCallback(tradeComputedForUniswapV2Like, provider, gasConfig, allowedSlippage)
    const uniswapV3Like = useUniswapCallback(tradeComputedForUniswapV3Like, provider, gasConfig, allowedSlippage)

    // balancer
    const exchangeProxyContract = useExchangeProxyContract(targetChainId)
    const balancer = useBalancerCallback(
        provider === TradeProvider.BALANCER ? tradeComputedForBalancer : null,
        exchangeProxyContract,
        allowedSlippage,
        gasConfig,
    )

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
        tradeComputed as TradeComputed<NativeTokenWrapper>,
        gasConfig,
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
        case TradeProvider.SASHIMISWAP:
            return uniswapV2Like
        case TradeProvider.QUICKSWAP:
            return uniswapV2Like
        case TradeProvider.PANCAKESWAP:
            return uniswapV2Like
        case TradeProvider.WANNASWAP:
            return uniswapV2Like
        case TradeProvider.TRISOLARIS:
            return uniswapV2Like
        case TradeProvider.VENOMSWAP:
            return uniswapV2Like
        case TradeProvider.OPENSWAP:
            return uniswapV2Like
        case TradeProvider.MDEX:
            return uniswapV2Like
        case TradeProvider.DIFFUSION:
            return uniswapV2Like
        case TradeProvider.EVMOSWAP:
            return uniswapV2Like
        case TradeProvider.CRONUS:
        case TradeProvider.DEFIKINGDOMS:
            return uniswapV2Like
        case TradeProvider.ZRX:
            return zrx
        case TradeProvider.BALANCER:
            return balancer
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
