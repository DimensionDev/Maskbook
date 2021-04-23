import type { Trade } from '@uniswap/sdk'
import { unreachable } from '../../../utils/utils'
import { SwapQuoteResponse, SwapResponse, TradeComputed, TradeProvider } from '../types'
import { useTradeCallback as useEtherCallback } from './ether/useTradeCallback'
import { useTradeCallback as useZrxCallback } from './0x/useTradeCallback'
import { useTradeCallback as useUniswapCallback } from './uniswap/useTradeCallback'
import { useTradeCallback as useBalancerCallback } from './balancer/useTradeCallback'
import { useRouterV2Contract as useUniswapRouterV2Contract } from '../contracts/uniswap/useRouterV2Contract'
import { useRouterV2Contract as useSushiSwapRouterV2Contract } from '../contracts/sushiswap/useRouterV2Contract'
import { useRouterV2Contract as useSashimiSwapRouterV2Contract } from '../contracts/sashimiswap/useRouterV2Contract'
import { useExchangeProxyContract } from '../contracts/balancer/useExchangeProxyContract'
import type { EtherWrapper } from './ether/useTradeComputed'
import { isEtherWrapper } from '../helpers'

export function useTradeCallback(provider: TradeProvider, tradeComputed: TradeComputed<unknown> | null) {
    // create contract instances for uniswap and sushiswap
    const uniswapRouterV2Contract = useUniswapRouterV2Contract()
    const sushiswapRouterV2Contract = useSushiSwapRouterV2Contract()
    const sashimiswapRouterV2Contract = useSashimiSwapRouterV2Contract()
    const exchangeProxyContract = useExchangeProxyContract()

    // create trade callbacks
    const isEtherWrapper_ = isEtherWrapper(tradeComputed)
    const ether = useEtherCallback(tradeComputed as TradeComputed<EtherWrapper>)

    const uniswap = useUniswapCallback(
        provider === TradeProvider.UNISWAP && !isEtherWrapper_ ? (tradeComputed as TradeComputed<Trade>) : null,
        uniswapRouterV2Contract,
    )
    const zrx = useZrxCallback(
        provider === TradeProvider.ZRX && !isEtherWrapper_ ? (tradeComputed as TradeComputed<SwapQuoteResponse>) : null,
    )
    const sushiswap = useUniswapCallback(
        provider === TradeProvider.SUSHISWAP && !isEtherWrapper_ ? (tradeComputed as TradeComputed<Trade>) : null,
        sushiswapRouterV2Contract,
    )
    const sashimiswap = useUniswapCallback(
        provider === TradeProvider.SASHIMISWAP && !isEtherWrapper_ ? (tradeComputed as TradeComputed<Trade>) : null,
        sashimiswapRouterV2Contract,
    )
    const balancer = useBalancerCallback(
        provider === TradeProvider.BALANCER && !isEtherWrapper_ ? (tradeComputed as TradeComputed<SwapResponse>) : null,
        exchangeProxyContract,
    )

    // the trade is an ETH-WETH pair
    if (isEtherWrapper_) return ether

    // handle trades by various provider
    switch (provider) {
        case TradeProvider.UNISWAP:
            return uniswap
        case TradeProvider.ZRX:
            return zrx
        case TradeProvider.SUSHISWAP:
            return sushiswap
        case TradeProvider.SASHIMISWAP:
            return sashimiswap
        case TradeProvider.BALANCER:
            return balancer
        default:
            unreachable(provider)
    }
}
