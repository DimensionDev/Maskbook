import { unreachable } from '@dimensiondev/maskbook-shared'
import { getConstant, useChainId } from '@dimensiondev/web3-shared'
import { createContext, useMemo } from 'react'
import {
    TRADE_CONSTANTS,
    UNISWAP_BASE_AGAINST_TOKENS,
    UNISWAP_CUSTOM_BASES,
    SUSHISWAP_BASE_AGAINST_TOKENS,
    SUSHISWAP_CUSTOM_BASES,
    SASHIMISWAP_BASE_AGAINST_TOKENS,
    SASHIMISWAP_CUSTOM_BASES,
    QUICKSWAP_BASE_AGAINST_TOKENS,
    QUICKSWAP_CUSTOM_BASES,
    PANCAKESWAP_BASE_AGAINST_TOKENS,
    PANCAKESWAP_CUSTOM_BASES,
} from '../constants'
import { TradeContext as TradeContext_, TradeProvider } from '../types'

export const TradeContext = createContext<TradeContext_ | null>(null)

export function useTradeContext(tradeProvider: TradeProvider) {
    const chainId = useChainId()
    return useMemo(() => {
        switch (tradeProvider) {
            case TradeProvider.UNISWAP:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_LIKE: true,
                    GRAPH_API: getConstant(TRADE_CONSTANTS, 'UNISWAP_THEGRAPH', chainId),
                    INIT_CODE_HASH: getConstant(TRADE_CONSTANTS, 'UNISWAP_INIT_CODE_HASH', chainId),
                    ROUTER_CONTRACT_ADDRESS: getConstant(TRADE_CONSTANTS, 'UNISWAP_ROUTER_ADDRESS', chainId),
                    FACTORY_CONTRACT_ADDRESS: getConstant(TRADE_CONSTANTS, 'UNISWAP_FACTORY_ADDRESS', chainId),
                    AGAINST_TOKENS: UNISWAP_BASE_AGAINST_TOKENS,
                    CUSTOM_TOKENS: UNISWAP_CUSTOM_BASES,
                }
            case TradeProvider.SUSHISWAP:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_LIKE: true,
                    GRAPH_API: getConstant(TRADE_CONSTANTS, 'SUSHISWAP_THEGRAPH', chainId),
                    INIT_CODE_HASH: getConstant(TRADE_CONSTANTS, 'SUSHISWAP_INIT_CODE_HASH', chainId),
                    ROUTER_CONTRACT_ADDRESS: getConstant(TRADE_CONSTANTS, 'SUSHISWAP_ROUTER_ADDRESS', chainId),
                    FACTORY_CONTRACT_ADDRESS: getConstant(TRADE_CONSTANTS, 'SUSHISWAP_FACTORY_ADDRESS', chainId),
                    AGAINST_TOKENS: SUSHISWAP_BASE_AGAINST_TOKENS,
                    CUSTOM_TOKENS: SUSHISWAP_CUSTOM_BASES,
                }
            case TradeProvider.SASHIMISWAP:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_LIKE: true,
                    GRAPH_API: getConstant(TRADE_CONSTANTS, 'SASHIMISWAP_THEGRAPH', chainId),
                    INIT_CODE_HASH: getConstant(TRADE_CONSTANTS, 'SASHIMISWAP_INIT_CODE_HASH', chainId),
                    ROUTER_CONTRACT_ADDRESS: getConstant(TRADE_CONSTANTS, 'SASHIMISWAP_ROUTER_ADDRESS', chainId),
                    FACTORY_CONTRACT_ADDRESS: getConstant(TRADE_CONSTANTS, 'SASHIMISWAP_FACTORY_ADDRESS', chainId),
                    AGAINST_TOKENS: SASHIMISWAP_BASE_AGAINST_TOKENS,
                    CUSTOM_TOKENS: SASHIMISWAP_CUSTOM_BASES,
                }
            case TradeProvider.QUICKSWAP:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_LIKE: true,
                    GRAPH_API: getConstant(TRADE_CONSTANTS, 'QUICKSWAP_THEGRAPH', chainId),
                    INIT_CODE_HASH: getConstant(TRADE_CONSTANTS, 'QUICKSWAP_INIT_CODE_HASH', chainId),
                    ROUTER_CONTRACT_ADDRESS: getConstant(TRADE_CONSTANTS, 'QUICKSWAP_ROUTER_ADDRESS', chainId),
                    FACTORY_CONTRACT_ADDRESS: getConstant(TRADE_CONSTANTS, 'QUICKSWAP_FACTORY_ADDRESS', chainId),
                    AGAINST_TOKENS: QUICKSWAP_BASE_AGAINST_TOKENS,
                    CUSTOM_TOKENS: QUICKSWAP_CUSTOM_BASES,
                }
            case TradeProvider.PANCAKESWAP:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_LIKE: true,
                    GRAPH_API: getConstant(TRADE_CONSTANTS, 'PANCAKESWAP_THEGRAPH', chainId),
                    INIT_CODE_HASH: getConstant(TRADE_CONSTANTS, 'PANCAKESWAP_INIT_CODE_HASH', chainId),
                    ROUTER_CONTRACT_ADDRESS: getConstant(TRADE_CONSTANTS, 'PANCAKESWAP_ROUTER_ADDRESS', chainId),
                    FACTORY_CONTRACT_ADDRESS: getConstant(TRADE_CONSTANTS, 'PANCAKESWAP_FACTORY_ADDRESS', chainId),
                    AGAINST_TOKENS: PANCAKESWAP_BASE_AGAINST_TOKENS,
                    CUSTOM_TOKENS: PANCAKESWAP_CUSTOM_BASES,
                }
            case TradeProvider.ZRX:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_LIKE: false,
                    GRAPH_API: '',
                    INIT_CODE_HASH: '',
                    ROUTER_CONTRACT_ADDRESS: '',
                    FACTORY_CONTRACT_ADDRESS: '',
                    AGAINST_TOKENS: {},
                    CUSTOM_TOKENS: {},
                } as TradeContext_
            case TradeProvider.BALANCER:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_LIKE: false,
                    GRAPH_API: '',
                    INIT_CODE_HASH: '',
                    ROUTER_CONTRACT_ADDRESS: getConstant(TRADE_CONSTANTS, 'BALANCER_EXCHANGE_PROXY_ADDRESS', chainId),
                    FACTORY_CONTRACT_ADDRESS: '',
                    AGAINST_TOKENS: {},
                    CUSTOM_TOKENS: {},
                } as TradeContext_
            default:
                unreachable(tradeProvider)
        }
    }, [chainId, tradeProvider])
}
