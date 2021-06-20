import { useMemo } from 'react'
import {
    useChainId,
    createERC20Token,
    FungibleTokenDetailed,
    EthereumTokenType,
    useConstant,
} from '@dimensiondev/web3-shared'
import { SwapQuoteResponse, TradeComputed, TradeProvider } from '../types'
import { TRADE_CONSTANTS } from '../constants'
import { safeUnreachable, ZERO } from '@dimensiondev/maskbook-shared'

export function useTradeApproveComputed(
    trade: TradeComputed<unknown> | null,
    provider: TradeProvider,
    token?: FungibleTokenDetailed,
) {
    const chainId = useChainId()
    const UNISWAP_V2_ROUTER_ADDRESS = useConstant(TRADE_CONSTANTS, 'UNISWAP_V2_ROUTER_ADDRESS')
    const SUSHISWAP_ROUTER_ADDRESS = useConstant(TRADE_CONSTANTS, 'SUSHISWAP_ROUTER_ADDRESS')
    const SASHIMISWAP_ROUTER_ADDRESS = useConstant(TRADE_CONSTANTS, 'SASHIMISWAP_ROUTER_ADDRESS')
    const QUICKSWAP_ROUTER_ADDRESS = useConstant(TRADE_CONSTANTS, 'QUICKSWAP_ROUTER_ADDRESS')
    const BALANCER_EXCHANGE_PROXY_ADDRESS = useConstant(TRADE_CONSTANTS, 'BALANCER_EXCHANGE_PROXY_ADDRESS')

    return useMemo(() => {
        return {
            approveToken:
                token?.type === EthereumTokenType.ERC20
                    ? createERC20Token(
                          chainId,
                          token.address,
                          token.decimals ?? 0,
                          token.name ?? '',
                          token.symbol ?? '',
                      )
                    : null,
            approveAmount: trade ? trade.inputAmount : ZERO,
            approveAddress: (() => {
                switch (provider) {
                    case TradeProvider.UNISWAP:
                        return UNISWAP_V2_ROUTER_ADDRESS
                    case TradeProvider.SUSHISWAP:
                        return SUSHISWAP_ROUTER_ADDRESS
                    case TradeProvider.SASHIMISWAP:
                        return SASHIMISWAP_ROUTER_ADDRESS
                    case TradeProvider.QUICKSWAP:
                        return QUICKSWAP_ROUTER_ADDRESS
                    case TradeProvider.ZRX:
                        return trade?.trade_ ? (trade.trade_ as SwapQuoteResponse).allowanceTarget : ''
                    case TradeProvider.BALANCER:
                        return BALANCER_EXCHANGE_PROXY_ADDRESS
                    default:
                        safeUnreachable(provider)
                        return ''
                }
            })(),
        }
    }, [chainId, trade, provider, token])
}
