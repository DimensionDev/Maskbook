import { getTraderConstants, useChainId } from '../../../../../web3-shared/evm'
import { useMemo } from 'react'
import type { TradeContext as TradeContext_ } from '../types'
import { TradeProvider } from '@masknet/public-api'
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
import { unreachable } from '@dimensiondev/kit'

export function useGetTradeContext(tradeProvider?: TradeProvider) {
    const chainId = useChainId()

    return useMemo<TradeContext_ | null>(() => {
        switch (tradeProvider) {
            case TradeProvider.UNISWAP_V2:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V2_LIKE: true,
                    GRAPH_API: getTraderConstants(chainId).UNISWAP_V2_THEGRAPH,
                    INIT_CODE_HASH: getTraderConstants(chainId).UNISWAP_V2_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: getTraderConstants(chainId).UNISWAP_V2_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: getTraderConstants(chainId).UNISWAP_V2_FACTORY_ADDRESS,
                    AGAINST_TOKENS: UNISWAP_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: UNISWAP_CUSTOM_BASES,
                }
            case TradeProvider.UNISWAP_V3:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V3_LIKE: true,
                    GRAPH_API: getTraderConstants(chainId).UNISWAP_V3_THEGRAPH,
                    INIT_CODE_HASH: getTraderConstants(chainId).UNISWAP_V3_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: getTraderConstants(chainId).UNISWAP_SWAP_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: getTraderConstants(chainId).UNISWAP_V3_FACTORY_ADDRESS,
                    AGAINST_TOKENS: UNISWAP_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: UNISWAP_CUSTOM_BASES,
                }
            case TradeProvider.SUSHISWAP:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V2_LIKE: true,
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
                    IS_UNISWAP_V2_LIKE: true,
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
                    IS_UNISWAP_V2_LIKE: true,
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
                    IS_UNISWAP_V2_LIKE: true,
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
                }
            case TradeProvider.BALANCER:
                return {
                    TYPE: tradeProvider,
                    ROUTER_CONTRACT_ADDRESS: getTraderConstants(chainId).BALANCER_EXCHANGE_PROXY_ADDRESS,
                }
            case TradeProvider.DODO:
                return {
                    TYPE: tradeProvider,
                    ROUTER_CONTRACT_ADDRESS: getTraderConstants(chainId).DODO_EXCHANGE_PROXY_ADDRESS,
                }
            case TradeProvider.BANCOR:
                return {
                    TYPE: tradeProvider,
                    ROUTER_CONTRACT_ADDRESS: getTraderConstants(chainId).BANCOR_EXCHANGE_PROXY_ADDRESS,
                }
            default:
                if (tradeProvider) unreachable(tradeProvider)
                return null
        }
    }, [chainId, tradeProvider])
}
