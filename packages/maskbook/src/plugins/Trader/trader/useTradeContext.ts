import { unreachable } from '@dimensiondev/kit'
import { getTraderConstants, useChainId } from '@masknet/web3-shared'
import { createContext, useMemo } from 'react'
import {
    PANCAKESWAP_BASE_AGAINST_TOKENS,
    PANCAKESWAP_CUSTOM_BASES,
    QUICKSWAP_BASE_AGAINST_TOKENS,
    QUICKSWAP_CUSTOM_BASES,
    SASHIMISWAP_BASE_AGAINST_TOKENS,
    SASHIMISWAP_CUSTOM_BASES,
    SUSHISWAP_BASE_AGAINST_TOKENS,
    SUSHISWAP_CUSTOM_BASES,
    UNISWAP_BASE_AGAINST_TOKENS,
    UNISWAP_CUSTOM_BASES,
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
                    GRAPH_API: getTraderConstants(chainId).UNISWAP_THEGRAPH,
                    INIT_CODE_HASH: getTraderConstants(chainId).UNISWAP_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: getTraderConstants(chainId).UNISWAP_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: getTraderConstants(chainId).UNISWAP_FACTORY_ADDRESS,
                    AGAINST_TOKENS: UNISWAP_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: UNISWAP_CUSTOM_BASES,
                }
            case TradeProvider.SUSHISWAP:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_LIKE: true,
                    GRAPH_API: getTraderConstants(chainId).SUSHISWAP_THEGRAPH,
                    INIT_CODE_HASH: getTraderConstants(chainId).SUSHISWAP_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: getTraderConstants(chainId).SUSHISWAP_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: getTraderConstants(chainId).SUSHISWAP_FACTORY_ADDRESS,
                    AGAINST_TOKENS: SUSHISWAP_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: SUSHISWAP_CUSTOM_BASES,
                }
            case TradeProvider.SASHIMISWAP:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_LIKE: true,
                    GRAPH_API: getTraderConstants(chainId).SASHIMISWAP_THEGRAPH,
                    INIT_CODE_HASH: getTraderConstants(chainId).SASHIMISWAP_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: getTraderConstants(chainId).SASHIMISWAP_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: getTraderConstants(chainId).SASHIMISWAP_FACTORY_ADDRESS,
                    AGAINST_TOKENS: SASHIMISWAP_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: SASHIMISWAP_CUSTOM_BASES,
                }
            case TradeProvider.QUICKSWAP:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_LIKE: true,
                    GRAPH_API: getTraderConstants(chainId).QUICKSWAP_THEGRAPH,
                    INIT_CODE_HASH: getTraderConstants(chainId).QUICKSWAP_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: getTraderConstants(chainId).QUICKSWAP_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: getTraderConstants(chainId).QUICKSWAP_FACTORY_ADDRESS,
                    AGAINST_TOKENS: QUICKSWAP_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: QUICKSWAP_CUSTOM_BASES,
                }
            case TradeProvider.PANCAKESWAP:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_LIKE: true,
                    GRAPH_API: getTraderConstants(chainId).PANCAKESWAP_THEGRAPH,
                    INIT_CODE_HASH: getTraderConstants(chainId).PANCAKESWAP_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: getTraderConstants(chainId).PANCAKESWAP_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: getTraderConstants(chainId).PANCAKESWAP_FACTORY_ADDRESS,
                    AGAINST_TOKENS: PANCAKESWAP_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
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
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: {},
                } as TradeContext_
            case TradeProvider.BALANCER:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_LIKE: false,
                    GRAPH_API: '',
                    INIT_CODE_HASH: '',
                    ROUTER_CONTRACT_ADDRESS: getTraderConstants(chainId).BALANCER_EXCHANGE_PROXY_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: '',
                    AGAINST_TOKENS: {},
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: {},
                } as TradeContext_
            default:
                unreachable(tradeProvider)
        }
    }, [chainId, tradeProvider])
}
