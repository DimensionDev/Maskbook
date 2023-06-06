import { useMemo } from 'react'
import { type ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { type FungibleToken, ZERO } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import { TradeProvider } from '@masknet/public-api'
import type { SwapQuoteResponse, TradeComputed } from '../types/index.js'
import { useGetTradeContext } from './useGetTradeContext.js'
import type { Web3Helper } from '@masknet/web3-helpers'

// Only Support EVM ERC20
export function useTradeApproveComputed(
    trade: TradeComputed | null,
    provider?: TradeProvider,
    token?: Web3Helper.FungibleTokenAll,
) {
    const { pluginID } = useNetworkContext()
    const { chainId } = useChainContext<NetworkPluginID.PLUGIN_EVM>()
    const context = useGetTradeContext(provider)

    return useMemo(() => {
        return {
            approveToken:
                pluginID === NetworkPluginID.PLUGIN_EVM && token?.schema === SchemaType.ERC20
                    ? (token as FungibleToken<ChainId, SchemaType.ERC20>)
                    : null,
            approveAmount: trade ? trade.inputAmount : ZERO,
            approveAddress: (() => {
                if (context?.TYPE === TradeProvider.ZRX)
                    return trade?.trade_ ? (trade.trade_ as SwapQuoteResponse).allowanceTarget : ''
                if (context?.TYPE === TradeProvider.OPENOCEAN)
                    return trade?.trade_ ? (trade.trade_ as SwapQuoteResponse).to : context.SPENDER_CONTRACT_ADDRESS
                return context?.SPENDER_CONTRACT_ADDRESS ?? ''
            })(),
        }
    }, [chainId, trade, token, context])
}
