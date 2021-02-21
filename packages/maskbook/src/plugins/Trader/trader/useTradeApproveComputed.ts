import { useMemo } from 'react'
import { useChainId } from '../../../web3/hooks/useChainState'
import { createERC20Token } from '../../../web3/helpers'
import { SwapQuoteResponse, TradeComputed, TradeProvider, TradeStrategy } from '../types'
import { ERC20TokenDetailed, EthereumTokenType, EtherTokenDetailed } from '../../../web3/types'
import { useConstant } from '../../../web3/hooks/useConstant'
import { TRADE_CONSTANTS } from '../constants'
import { safeUnreachable } from '../../../utils/utils'
import BigNumber from 'bignumber.js'

export function useTradeApproveComputed(
    trade: TradeComputed<unknown> | null,
    provider: TradeProvider,
    token?: EtherTokenDetailed | ERC20TokenDetailed,
) {
    const chainId = useChainId()
    const UNISWAP_V2_ROUTER_ADDRESS = useConstant(TRADE_CONSTANTS, 'UNISWAP_V2_ROUTER_ADDRESS')
    const SUSHISWAP_ROUTER_ADDRESS = useConstant(TRADE_CONSTANTS, 'SUSHISWAP_ROUTER_ADDRESS')
    const SASHIMISWAP_ROUTER_ADDRESS = useConstant(TRADE_CONSTANTS, 'SASHIMISWAP_ROUTER_ADDRESS')
    const BALANCER_EXCHANGE_PROXY_ADDRESS = useConstant(TRADE_CONSTANTS, 'BALANCER_EXCHANGE_PROXY_ADDRESS')

    return useMemo(() => {
        if (!trade || !token || token.type !== EthereumTokenType.ERC20)
            return {
                approveToken: null,
                approveAmount: new BigNumber(0),
                approveAddress: '',
            }
        return {
            approveToken: createERC20Token(
                chainId,
                token.address,
                token.decimals ?? 0,
                token.name ?? '',
                token.symbol ?? '',
            ),
            approveAmount: trade.strategy === TradeStrategy.ExactIn ? trade.inputAmount : trade.outputAmount,
            approveAddress: (() => {
                switch (provider) {
                    case TradeProvider.UNISWAP:
                        return UNISWAP_V2_ROUTER_ADDRESS
                    case TradeProvider.SUSHISWAP:
                        return SUSHISWAP_ROUTER_ADDRESS
                    case TradeProvider.SASHIMISWAP:
                        return SASHIMISWAP_ROUTER_ADDRESS
                    case TradeProvider.ZRX:
                        return trade.trade_ ? (trade.trade_ as SwapQuoteResponse).allowanceTarget : ''
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
