import { createContext, useMemo } from 'react'
import { unreachable } from '@dimensiondev/kit'
import { TradeProvider } from '@masknet/public-api'
import { getTraderConstants } from '@masknet/web3-shared-evm'
import {
    PANCAKESWAP_BASE_AGAINST_TOKENS,
    PANCAKESWAP_CUSTOM_BASES,
    QUICKSWAP_BASE_AGAINST_TOKENS,
    QUICKSWAP_CUSTOM_BASES,
    SASHIMISWAP_BASE_AGAINST_TOKENS,
    SASHIMISWAP_CUSTOM_BASES,
    SUSHISWAP_BASE_AGAINST_TOKENS,
    SUSHISWAP_CUSTOM_BASES,
    OOLONGSWAP_BASE_AGAINST_TOKENS,
    OOLONGSWAP_CUSTOM_BASES,
    SWAPPERCHAN_BASE_AGAINST_TOKENS,
    SWAPPERCHAN_CUSTOM_BASES,
    SENPAISWAP_BASE_AGAINST_TOKENS,
    SENPAISWAP_CUSTOM_BASES,
    UNISWAP_BASE_AGAINST_TOKENS,
    UNISWAP_CUSTOM_BASES,
} from '../constants'
import type { TradeContext as TradeContext_ } from '../types'
import { TargetChainIdContext } from './useTargetChainIdContext'

export const TradeContext = createContext<TradeContext_ | null>(null)

export function useTradeContext(tradeProvider: TradeProvider) {
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()

    const TRADER_DEX = getTraderConstants(chainId)

    return useMemo<TradeContext_>(() => {
        switch (tradeProvider) {
            case TradeProvider.UNISWAP_V2:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V2_LIKE: true,
                    GRAPH_API: TRADER_DEX.UNISWAP_V2_THEGRAPH,
                    INIT_CODE_HASH: TRADER_DEX.UNISWAP_V2_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: TRADER_DEX.UNISWAP_V2_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: TRADER_DEX.UNISWAP_V2_FACTORY_ADDRESS,
                    AGAINST_TOKENS: UNISWAP_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: UNISWAP_CUSTOM_BASES,
                }
            case TradeProvider.UNISWAP_V3:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V3_LIKE: true,
                    GRAPH_API: TRADER_DEX.UNISWAP_V3_THEGRAPH,
                    INIT_CODE_HASH: TRADER_DEX.UNISWAP_V3_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: TRADER_DEX.UNISWAP_SWAP_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: TRADER_DEX.UNISWAP_V3_FACTORY_ADDRESS,
                    AGAINST_TOKENS: UNISWAP_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: UNISWAP_CUSTOM_BASES,
                }
            case TradeProvider.SUSHISWAP:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V2_LIKE: true,
                    GRAPH_API: TRADER_DEX.SUSHISWAP_THEGRAPH,
                    INIT_CODE_HASH: TRADER_DEX.SUSHISWAP_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: TRADER_DEX.SUSHISWAP_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: TRADER_DEX.SUSHISWAP_FACTORY_ADDRESS,
                    AGAINST_TOKENS: SUSHISWAP_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: SUSHISWAP_CUSTOM_BASES,
                }
            case TradeProvider.SASHIMISWAP:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V2_LIKE: true,
                    GRAPH_API: TRADER_DEX.SASHIMISWAP_THEGRAPH,
                    INIT_CODE_HASH: TRADER_DEX.SASHIMISWAP_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: TRADER_DEX.SASHIMISWAP_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: TRADER_DEX.SASHIMISWAP_FACTORY_ADDRESS,
                    AGAINST_TOKENS: SASHIMISWAP_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: SASHIMISWAP_CUSTOM_BASES,
                }
            case TradeProvider.QUICKSWAP:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V2_LIKE: true,
                    GRAPH_API: TRADER_DEX.QUICKSWAP_THEGRAPH,
                    INIT_CODE_HASH: TRADER_DEX.QUICKSWAP_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: TRADER_DEX.QUICKSWAP_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: TRADER_DEX.QUICKSWAP_FACTORY_ADDRESS,
                    AGAINST_TOKENS: QUICKSWAP_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: QUICKSWAP_CUSTOM_BASES,
                }
            case TradeProvider.PANCAKESWAP:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V2_LIKE: true,
                    GRAPH_API: TRADER_DEX.PANCAKESWAP_THEGRAPH,
                    INIT_CODE_HASH: TRADER_DEX.PANCAKESWAP_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: TRADER_DEX.PANCAKESWAP_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: TRADER_DEX.PANCAKESWAP_FACTORY_ADDRESS,
                    AGAINST_TOKENS: PANCAKESWAP_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: PANCAKESWAP_CUSTOM_BASES,
                }
            case TradeProvider.OOLONGSWAP:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V2_LIKE: true,
                    GRAPH_API: TRADER_DEX.OOLONGSWAP_THEGRAPH,
                    INIT_CODE_HASH: TRADER_DEX.OOLONGSWAP_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: TRADER_DEX.OOLONGSWAP_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: TRADER_DEX.OOLONGSWAP_FACTORY_ADDRESS,
                    AGAINST_TOKENS: OOLONGSWAP_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: OOLONGSWAP_CUSTOM_BASES,
                }
            case TradeProvider.SWAPPERCHAN:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V2_LIKE: true,
                    GRAPH_API: TRADER_DEX.SWAPPERCHAN_THEGRAPH,
                    INIT_CODE_HASH: TRADER_DEX.SWAPPERCHAN_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: TRADER_DEX.SWAPPERCHAN_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: TRADER_DEX.SWAPPERCHAN_FACTORY_ADDRESS,
                    AGAINST_TOKENS: SWAPPERCHAN_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: SWAPPERCHAN_CUSTOM_BASES,
                }
            case TradeProvider.SENPAISWAP:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V2_LIKE: true,
                    GRAPH_API: TRADER_DEX.SENPAISWAP_THEGRAPH,
                    INIT_CODE_HASH: TRADER_DEX.SENPAISWAP_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: TRADER_DEX.SENPAISWAP_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: TRADER_DEX.SENPAISWAP_FACTORY_ADDRESS,
                    AGAINST_TOKENS: SENPAISWAP_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: SENPAISWAP_CUSTOM_BASES,
                }
            case TradeProvider.ZRX:
                return {
                    TYPE: tradeProvider,
                }
            case TradeProvider.BALANCER:
                return {
                    TYPE: tradeProvider,
                    ROUTER_CONTRACT_ADDRESS: TRADER_DEX.BALANCER_EXCHANGE_PROXY_ADDRESS,
                }
            case TradeProvider.DODO:
                return {
                    TYPE: tradeProvider,
                    ROUTER_CONTRACT_ADDRESS: TRADER_DEX.DODO_EXCHANGE_PROXY_ADDRESS,
                }
            case TradeProvider.BANCOR:
                return {
                    TYPE: tradeProvider,
                    ROUTER_CONTRACT_ADDRESS: TRADER_DEX.BANCOR_EXCHANGE_PROXY_ADDRESS,
                }
            case TradeProvider.OPENOCEAN:
                return {
                    TYPE: tradeProvider,
                    ROUTER_CONTRACT_ADDRESS: TRADER_DEX.OPENOCEAN_EXCHANGE_PROXY_ADDRESS,
                }
            default:
                unreachable(tradeProvider)
        }
    }, [chainId, tradeProvider])
}
