import { useMemo } from 'react'
import { createERC20Token, SchemaType } from '@masknet/web3-shared-evm'
import { ZERO } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { useChainContext, useNetworkContext } from '@masknet/web3-hooks-base'
import { TradeProvider } from '@masknet/public-api'
import type { SwapQuoteResponse, TradeComputed } from '../types/index.js'
import { useGetTradeContext } from './useGetTradeContext.js'
import type { Web3Helper } from '@masknet/web3-helpers'

// Only Support EVM ERC20
export function useTradeApproveComputed(
    trade: TradeComputed<unknown> | null,
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
                    ? createERC20Token(chainId, token.address, token.name, token.symbol, token.decimals)
                    : null,
            approveAmount: trade ? trade.inputAmount : ZERO,
            approveAddress: (() => {
                if (context?.TYPE === TradeProvider.ZRX)
                    return trade?.trade_ ? (trade.trade_ as SwapQuoteResponse).allowanceTarget : ''
                if (context?.TYPE === TradeProvider.OPENOCEAN)
                    return trade?.trade_ ? (trade?.trade_ as SwapQuoteResponse).to : context?.SPENDER_CONTRACT_ADDRESS
                return context?.SPENDER_CONTRACT_ADDRESS ?? ''
            })(),
        }
    }, [chainId, trade, token, context])
}
