import { useMemo } from 'react'
import { ChainId, createERC20Token, SchemaType } from '@masknet/web3-shared-evm'
import { FungibleToken, ZERO } from '@masknet/web3-shared-base'
import { TradeProvider } from '@masknet/public-api'
import type { SwapQuoteResponse, TradeComputed } from '../types'
import { useGetTradeContext } from './useGetTradeContext'
import { TargetChainIdContext } from './useTargetChainIdContext'

export function useTradeApproveComputed(
    trade: TradeComputed<unknown> | null,
    provider?: TradeProvider,
    token?: FungibleToken<ChainId, SchemaType>,
) {
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    const context = useGetTradeContext(provider)

    return useMemo(() => {
        return {
            approveToken:
                token?.schema === SchemaType.ERC20
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
