import { createContext, useMemo } from 'react'
import { TradeContext as TradeContext_, TradeProvider } from '../types'
import { useChainId } from '../../../web3/hooks/useChainState'
import {
    SUSHISWAP_BASE_AGAINST_TOKENS,
    SUSHISWAP_CUSTOM_BASES,
    SUSHISWAP_INIT_CODE_HASH,
    SASHIMISWAP_BASE_AGAINST_TOKENS,
    SASHIMISWAP_CUSTOM_BASES,
    SASHIMISWAP_INIT_CODE_HASH,
    THEGRAPH_SUSHISWAP_FORK,
    THEGRAPH_SASHIMISWAP,
    THEGRAPH_UNISWAP_V2,
    TRADE_CONSTANTS,
    UNISWAP_BASE_AGAINST_TOKENS,
    UNISWAP_CUSTOM_BASES,
    UNISWAP_INIT_CODE_HASH,
} from '../constants'
import { getConstant } from '../../../web3/helpers'

export const TradeContext = createContext<TradeContext_ | null>(null)

export function useTradeContext(tradeProvider: TradeProvider) {
    const chainId = useChainId()
    return useMemo(() => {
        switch (tradeProvider) {
            case TradeProvider.UNISWAP:
                return {
                    GRAPH_API: THEGRAPH_UNISWAP_V2,
                    INIT_CODE_HASH: UNISWAP_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: getConstant(TRADE_CONSTANTS, 'UNISWAP_V2_ROUTER_ADDRESS', chainId),
                    FACTORY_CONTRACT_ADDRESS: getConstant(TRADE_CONSTANTS, 'UNISWAP_FACTORY_ADDRESS', chainId),
                    AGAINST_TOKENS: UNISWAP_BASE_AGAINST_TOKENS,
                    CUSTOM_TOKENS: UNISWAP_CUSTOM_BASES,
                }
            case TradeProvider.SUSHISWAP:
                return {
                    GRAPH_API: THEGRAPH_SUSHISWAP_FORK,
                    INIT_CODE_HASH: SUSHISWAP_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: getConstant(TRADE_CONSTANTS, 'SUSHISWAP_ROUTER_ADDRESS', chainId),
                    FACTORY_CONTRACT_ADDRESS: getConstant(TRADE_CONSTANTS, 'SUSHISWAP_FACTORY_ADDRESS', chainId),
                    AGAINST_TOKENS: SUSHISWAP_BASE_AGAINST_TOKENS,
                    CUSTOM_TOKENS: SUSHISWAP_CUSTOM_BASES,
                }
            case TradeProvider.SASHIMISWAP:
                return {
                    GRAPH_API: THEGRAPH_SASHIMISWAP,
                    INIT_CODE_HASH: SASHIMISWAP_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: getConstant(TRADE_CONSTANTS, 'SASHIMISWAP_ROUTER_ADDRESS', chainId),
                    FACTORY_CONTRACT_ADDRESS: getConstant(TRADE_CONSTANTS, 'SASHIMISWAP_FACTORY_ADDRESS', chainId),
                    AGAINST_TOKENS: SASHIMISWAP_BASE_AGAINST_TOKENS,
                    CUSTOM_TOKENS: SASHIMISWAP_CUSTOM_BASES,
                }
            default:
                return null
        }
    }, [chainId, tradeProvider])
}
