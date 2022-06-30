import { getTraderConstants } from '@masknet/web3-shared-evm'
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
    TRADERJOE_BASE_AGAINST_TOKENS,
    TRADERJOE_CUSTOM_BASES,
    PANGOLIN_BASE_AGAINST_TOKENS,
    PANGOLIN_CUSTOM_BASES,
    WANNASWAP_BASE_AGAINST_TOKENS,
    WANNASWAP_CUSTOM_BASES,
    TRISOLARIS_BASE_AGAINST_TOKENS,
    TRISOLARIS_CUSTOM_BASES,
    BEAMSWAP_BASE_AGAINST_TOKENS,
    BEAMSWAP_CUSTOM_BASES,
    STELLASWAP_BASE_AGAINST_TOKENS,
    STELLASWAP_CUSTOM_BASES,
    PADSWAP_BASE_AGAINST_TOKENS,
    PADSWAP_CUSTOM_BASES,
    MDEX_BASE_AGAINST_TOKENS,
    MDEX_CUSTOM_BASES,
    SOLFLARE_BASE_AGAINST_TOKENS,
    SOLFLARE_CUSTOM_BASES,
    ZENLINK_BASE_AGAINST_TOKENS,
    ZENLINK_CUSTOM_BASES,
    VENOMSWAP_BASE_AGAINST_TOKENS,
    VENOMSWAP_CUSTOM_BASES,
    OPENSWAP_BASE_AGAINST_TOKENS,
    OPENSWAP_CUSTOM_BASES,
    DEFIKINGDOMS_BASE_AGAINST_TOKENS,
    DEFIKINGDOMS_CUSTOM_BASES,
} from '../constants'
import { unreachable } from '@dimensiondev/kit'
import { TargetChainIdContext } from '@masknet/plugin-infra/web3-evm'

export function useGetTradeContext(tradeProvider?: TradeProvider) {
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    return useMemo<TradeContext_ | null>(() => {
        const DEX_TRADE = getTraderConstants(chainId)
        switch (tradeProvider) {
            case TradeProvider.UNISWAP_V2:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V2_LIKE: true,
                    GRAPH_API: DEX_TRADE.UNISWAP_V2_THEGRAPH,
                    INIT_CODE_HASH: DEX_TRADE.UNISWAP_V2_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: DEX_TRADE.UNISWAP_V2_ROUTER_ADDRESS,
                    SPENDER_CONTRACT_ADDRESS: DEX_TRADE.UNISWAP_V2_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: DEX_TRADE.UNISWAP_V2_FACTORY_ADDRESS,
                    AGAINST_TOKENS: UNISWAP_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: UNISWAP_CUSTOM_BASES,
                }
            case TradeProvider.UNISWAP_V3:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V3_LIKE: true,
                    GRAPH_API: DEX_TRADE.UNISWAP_V3_THEGRAPH,
                    INIT_CODE_HASH: DEX_TRADE.UNISWAP_V3_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: DEX_TRADE.UNISWAP_SWAP_ROUTER_ADDRESS,
                    SPENDER_CONTRACT_ADDRESS: DEX_TRADE.UNISWAP_SWAP_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: DEX_TRADE.UNISWAP_V3_FACTORY_ADDRESS,
                    AGAINST_TOKENS: UNISWAP_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: UNISWAP_CUSTOM_BASES,
                }
            case TradeProvider.SUSHISWAP:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V2_LIKE: true,
                    GRAPH_API: DEX_TRADE.SUSHISWAP_THEGRAPH,
                    INIT_CODE_HASH: DEX_TRADE.SUSHISWAP_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: DEX_TRADE.SUSHISWAP_ROUTER_ADDRESS,
                    SPENDER_CONTRACT_ADDRESS: DEX_TRADE.SUSHISWAP_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: DEX_TRADE.SUSHISWAP_FACTORY_ADDRESS,
                    AGAINST_TOKENS: SUSHISWAP_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: SUSHISWAP_CUSTOM_BASES,
                }
            case TradeProvider.SASHIMISWAP:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V2_LIKE: true,
                    GRAPH_API: DEX_TRADE.SASHIMISWAP_THEGRAPH,
                    INIT_CODE_HASH: DEX_TRADE.SASHIMISWAP_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: DEX_TRADE.SASHIMISWAP_ROUTER_ADDRESS,
                    SPENDER_CONTRACT_ADDRESS: DEX_TRADE.SASHIMISWAP_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: DEX_TRADE.SASHIMISWAP_FACTORY_ADDRESS,
                    AGAINST_TOKENS: SASHIMISWAP_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: SASHIMISWAP_CUSTOM_BASES,
                }
            case TradeProvider.QUICKSWAP:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V2_LIKE: true,
                    GRAPH_API: DEX_TRADE.QUICKSWAP_THEGRAPH,
                    INIT_CODE_HASH: DEX_TRADE.QUICKSWAP_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: DEX_TRADE.QUICKSWAP_ROUTER_ADDRESS,
                    SPENDER_CONTRACT_ADDRESS: DEX_TRADE.QUICKSWAP_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: DEX_TRADE.QUICKSWAP_FACTORY_ADDRESS,
                    AGAINST_TOKENS: QUICKSWAP_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: QUICKSWAP_CUSTOM_BASES,
                }
            case TradeProvider.PANCAKESWAP:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V2_LIKE: true,
                    GRAPH_API: DEX_TRADE.PANCAKESWAP_THEGRAPH,
                    INIT_CODE_HASH: DEX_TRADE.PANCAKESWAP_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: DEX_TRADE.PANCAKESWAP_ROUTER_ADDRESS,
                    SPENDER_CONTRACT_ADDRESS: DEX_TRADE.PANCAKESWAP_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: DEX_TRADE.PANCAKESWAP_FACTORY_ADDRESS,
                    AGAINST_TOKENS: PANCAKESWAP_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: PANCAKESWAP_CUSTOM_BASES,
                }
            case TradeProvider.TRADERJOE:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V2_LIKE: true,
                    GRAPH_API: DEX_TRADE.TRADERJOE_THEGRAPH,
                    INIT_CODE_HASH: DEX_TRADE.TRADERJOE_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: DEX_TRADE.TRADERJOE_ROUTER_ADDRESS,
                    SPENDER_CONTRACT_ADDRESS: DEX_TRADE.TRADERJOE_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: DEX_TRADE.TRADERJOE_FACTORY_ADDRESS,
                    AGAINST_TOKENS: TRADERJOE_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: TRADERJOE_CUSTOM_BASES,
                }
            case TradeProvider.PANGOLIN:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V2_LIKE: true,
                    GRAPH_API: DEX_TRADE.PANGOLIN_THEGRAPH,
                    INIT_CODE_HASH: DEX_TRADE.PANGOLIN_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: DEX_TRADE.PANGOLIN_ROUTER_ADDRESS,
                    SPENDER_CONTRACT_ADDRESS: DEX_TRADE.PANGOLIN_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: DEX_TRADE.PANGOLIN_FACTORY_ADDRESS,
                    AGAINST_TOKENS: PANGOLIN_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: PANGOLIN_CUSTOM_BASES,
                }
            case TradeProvider.WANNASWAP:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V2_LIKE: true,
                    GRAPH_API: DEX_TRADE.WANNASWAP_THEGRAPH,
                    INIT_CODE_HASH: DEX_TRADE.WANNASWAP_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: DEX_TRADE.WANNASWAP_ROUTER_V2_ADDRESS,
                    SPENDER_CONTRACT_ADDRESS: DEX_TRADE.WANNASWAP_ROUTER_V2_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: DEX_TRADE.WANNASWAP_FACTORY_ADDRESS,
                    AGAINST_TOKENS: WANNASWAP_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: WANNASWAP_CUSTOM_BASES,
                }
            case TradeProvider.TRISOLARIS:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V2_LIKE: true,
                    GRAPH_API: DEX_TRADE.TRISOLARIS_THEGRAPH,
                    INIT_CODE_HASH: DEX_TRADE.TRISOLARIS_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: DEX_TRADE.TRISOLARIS_ROUTER_ADDRESS,
                    SPENDER_CONTRACT_ADDRESS: DEX_TRADE.TRISOLARIS_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: DEX_TRADE.TRISOLARIS_FACTORY_ADDRESS,
                    AGAINST_TOKENS: TRISOLARIS_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: TRISOLARIS_CUSTOM_BASES,
                }
            case TradeProvider.BEAMSWAP:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V2_LIKE: true,
                    GRAPH_API: DEX_TRADE.BEAMSWAP_THEGRAPH,
                    INIT_CODE_HASH: DEX_TRADE.BEAMSWAP_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: DEX_TRADE.BEAMSWAP_ROUTER_ADDRESS,
                    SPENDER_CONTRACT_ADDRESS: DEX_TRADE.BEAMSWAP_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: DEX_TRADE.BEAMSWAP_FACTORY_ADDRESS,
                    AGAINST_TOKENS: BEAMSWAP_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: BEAMSWAP_CUSTOM_BASES,
                }
            case TradeProvider.STELLASWAP:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V2_LIKE: true,
                    GRAPH_API: DEX_TRADE.STELLASWAP_THEGRAPH,
                    INIT_CODE_HASH: DEX_TRADE.STELLASWAP_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: DEX_TRADE.STELLASWAP_ROUTER_ADDRESS,
                    SPENDER_CONTRACT_ADDRESS: DEX_TRADE.STELLASWAP_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: DEX_TRADE.STELLASWAP_FACTORY_ADDRESS,
                    AGAINST_TOKENS: STELLASWAP_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: STELLASWAP_CUSTOM_BASES,
                }
            case TradeProvider.PADSWAP:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V2_LIKE: true,
                    GRAPH_API: DEX_TRADE.PADSWAP_THEGRAPH,
                    INIT_CODE_HASH: DEX_TRADE.PADSWAP_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: DEX_TRADE.PADSWAP_ROUTER_ADDRESS,
                    SPENDER_CONTRACT_ADDRESS: DEX_TRADE.PADSWAP_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: DEX_TRADE.PADSWAP_FACTORY_ADDRESS,
                    AGAINST_TOKENS: PADSWAP_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: PADSWAP_CUSTOM_BASES,
                }
            case TradeProvider.MDEX:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V2_LIKE: true,
                    GRAPH_API: DEX_TRADE.MDEX_THEGRAPH,
                    INIT_CODE_HASH: DEX_TRADE.MDEX_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: DEX_TRADE.MDEX_ROUTER_ADDRESS,
                    SPENDER_CONTRACT_ADDRESS: DEX_TRADE.MDEX_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: DEX_TRADE.MDEX_FACTORY_ADDRESS,
                    AGAINST_TOKENS: MDEX_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: MDEX_CUSTOM_BASES,
                }
            case TradeProvider.SOLFLARE:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V2_LIKE: true,
                    GRAPH_API: DEX_TRADE.SOLFLARE_THEGRAPH,
                    INIT_CODE_HASH: DEX_TRADE.SOLFLARE_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: DEX_TRADE.SOLFLARE_ROUTER_ADDRESS,
                    SPENDER_CONTRACT_ADDRESS: DEX_TRADE.SOLFLARE_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: DEX_TRADE.SOLFLARE_FACTORY_ADDRESS,
                    AGAINST_TOKENS: SOLFLARE_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: SOLFLARE_CUSTOM_BASES,
                }
            case TradeProvider.ZENLINK:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V2_LIKE: true,
                    GRAPH_API: DEX_TRADE.ZENLINK_THEGRAPH,
                    INIT_CODE_HASH: DEX_TRADE.ZENLINK_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: DEX_TRADE.ZENLINK_ROUTER_ADDRESS,
                    SPENDER_CONTRACT_ADDRESS: DEX_TRADE.ZENLINK_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: DEX_TRADE.ZENLINK_FACTORY_ADDRESS,
                    AGAINST_TOKENS: ZENLINK_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: ZENLINK_CUSTOM_BASES,
                }
            case TradeProvider.VENOMSWAP:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V2_LIKE: true,
                    GRAPH_API: DEX_TRADE.VENOMSWAP_THEGRAPH,
                    INIT_CODE_HASH: DEX_TRADE.VENOMSWAP_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: DEX_TRADE.VENOMSWAP_ROUTER_ADDRESS,
                    SPENDER_CONTRACT_ADDRESS: DEX_TRADE.VENOMSWAP_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: DEX_TRADE.VENOMSWAP_FACTORY_ADDRESS,
                    AGAINST_TOKENS: VENOMSWAP_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: VENOMSWAP_CUSTOM_BASES,
                }
            case TradeProvider.OPENSWAP:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V2_LIKE: true,
                    GRAPH_API: DEX_TRADE.OPENSWAP_THEGRAPH,
                    INIT_CODE_HASH: DEX_TRADE.OPENSWAP_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: DEX_TRADE.OPENSWAP_ROUTER_ADDRESS,
                    SPENDER_CONTRACT_ADDRESS: DEX_TRADE.OPENSWAP_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: DEX_TRADE.OPENSWAP_FACTORY_ADDRESS,
                    AGAINST_TOKENS: OPENSWAP_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: OPENSWAP_CUSTOM_BASES,
                }
            case TradeProvider.DEFIKINGDOMS:
                return {
                    TYPE: tradeProvider,
                    IS_UNISWAP_V2_LIKE: true,
                    GRAPH_API: DEX_TRADE.DEFIKINGDOMS_THEGRAPH,
                    INIT_CODE_HASH: DEX_TRADE.DEFIKINGDOMS_INIT_CODE_HASH,
                    ROUTER_CONTRACT_ADDRESS: DEX_TRADE.DEFIKINGDOMS_ROUTER_ADDRESS,
                    SPENDER_CONTRACT_ADDRESS: DEX_TRADE.DEFIKINGDOMS_ROUTER_ADDRESS,
                    FACTORY_CONTRACT_ADDRESS: DEX_TRADE.DEFIKINGDOMS_FACTORY_ADDRESS,
                    AGAINST_TOKENS: DEFIKINGDOMS_BASE_AGAINST_TOKENS,
                    ADDITIONAL_TOKENS: {},
                    CUSTOM_TOKENS: DEFIKINGDOMS_CUSTOM_BASES,
                }
            case TradeProvider.ZRX:
                return {
                    TYPE: tradeProvider,
                }
            case TradeProvider.BALANCER:
                return {
                    TYPE: tradeProvider,
                    SPENDER_CONTRACT_ADDRESS: DEX_TRADE.BALANCER_EXCHANGE_PROXY_ADDRESS,
                }
            case TradeProvider.DODO:
                return {
                    TYPE: tradeProvider,
                    SPENDER_CONTRACT_ADDRESS: DEX_TRADE.DODO_EXCHANGE_PROXY_ADDRESS,
                }
            case TradeProvider.BANCOR:
                return {
                    TYPE: tradeProvider,
                    SPENDER_CONTRACT_ADDRESS: DEX_TRADE.BANCOR_EXCHANGE_PROXY_ADDRESS,
                }
            case TradeProvider.OPENOCEAN:
                return {
                    TYPE: tradeProvider,
                    SPENDER_CONTRACT_ADDRESS: DEX_TRADE.OPENOCEAN_EXCHANGE_PROXY_ADDRESS,
                }
            default:
                if (tradeProvider) unreachable(tradeProvider)
                return null
        }
    }, [chainId, tradeProvider])
}
