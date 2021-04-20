import type { Trade } from '@uniswap/sdk'
import { unreachable } from '../../../utils/utils'
import { SwapQuoteResponse, SwapResponse, TradeComputed, TradeProvider, TradeStrategy } from '../types'
import { useTradeCallback as useZrxCallback } from './0x/useTradeCallback'
import { useTradeCallback as useUniswapCallback } from './uniswap/useTradeCallback'
import { useTradeCallback as useBalancerCallback } from './balancer/useTradeCallback'
import { useRouterV2Contract as useUniswapRouterV2Contract } from '../contracts/uniswap/useRouterV2Contract'
import { useRouterV2Contract as useSushiSwapRouterV2Contract } from '../contracts/sushiswap/useRouterV2Contract'
import { useRouterV2Contract as useSashimiSwapRouterV2Contract } from '../contracts/sashimiswap/useRouterV2Contract'
import { useExchangeProxyContract } from '../contracts/balancer/useExchangeProxyContract'
import { useEtherWrapperCallback } from '../../../web3/hooks/useEtherWrapperCallback'
import { EthereumTokenType } from '../../../web3/types'
import { useConstant } from '../../../web3/hooks/useConstant'
import { CONSTANTS } from '../../../web3/constants'
import { isSameAddress } from '../../../web3/helpers'

export function useTradeCallback(provider: TradeProvider, tradeComputed: TradeComputed<unknown> | null) {
    // create contract instances for uniswap and sushiswap
    const uniswapRouterV2Contract = useUniswapRouterV2Contract()
    const sushiswapRouterV2Contract = useSushiSwapRouterV2Contract()
    const sashimiswapRouterV2Contract = useSashimiSwapRouterV2Contract()
    const exchangeProxyContract = useExchangeProxyContract()

    // for trade callbacks
    const uniswap = useUniswapCallback(
        provider === TradeProvider.UNISWAP ? (tradeComputed as TradeComputed<Trade>) : null,
        uniswapRouterV2Contract,
    )
    const zrx = useZrxCallback(
        provider === TradeProvider.ZRX ? (tradeComputed as TradeComputed<SwapQuoteResponse>) : null,
    )
    const sushiswap = useUniswapCallback(
        provider === TradeProvider.SUSHISWAP ? (tradeComputed as TradeComputed<Trade>) : null,
        sushiswapRouterV2Contract,
    )
    const sashimiswap = useUniswapCallback(
        provider === TradeProvider.SASHIMISWAP ? (tradeComputed as TradeComputed<Trade>) : null,
        sashimiswapRouterV2Contract,
    )
    const balancer = useBalancerCallback(
        provider === TradeProvider.BALANCER ? (tradeComputed as TradeComputed<SwapResponse>) : null,
        exchangeProxyContract,
    )

    // weth address
    const WETH_ADDRESS = useConstant(CONSTANTS, 'WETH_ADDRESS')

    // for ether callback
    const [transactionState, wrapCallback, unwrapCallback, resetCallback] = useEtherWrapperCallback()

    if (
        (tradeComputed?.inputToken?.type === EthereumTokenType.Ether &&
            isSameAddress(tradeComputed.outputToken?.address ?? '', WETH_ADDRESS)) ||
        (tradeComputed?.outputToken?.type === EthereumTokenType.Ether &&
            isSameAddress(tradeComputed.inputToken?.address ?? '', WETH_ADDRESS))
    ) {
        return [
            transactionState,
            async () => {
                if (!tradeComputed.inputToken || !tradeComputed.outputToken) return

                // input amount and output amount are the same value
                const tradeAmount = tradeComputed.inputAmount.isZero()
                    ? tradeComputed.outputAmount.toFixed()
                    : tradeComputed.inputAmount.toFixed()

                if (
                    (tradeComputed.strategy === TradeStrategy.ExactIn &&
                        tradeComputed.inputToken.type === EthereumTokenType.Ether) ||
                    (tradeComputed.strategy === TradeStrategy.ExactOut &&
                        tradeComputed.outputToken.type === EthereumTokenType.Ether)
                )
                    wrapCallback(tradeAmount)
                else unwrapCallback(false, tradeAmount)
            },
            resetCallback,
        ] as const
    }

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
