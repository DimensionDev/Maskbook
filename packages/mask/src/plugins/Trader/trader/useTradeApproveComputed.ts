import { useMemo } from 'react'
import { createERC20Token, EthereumTokenType, FungibleTokenDetailed } from '@masknet/web3-shared-evm'
import { ZERO } from '@masknet/web3-shared-base'
import { TradeProvider } from '@masknet/public-api'
import type { SwapQuoteResponse, TradeComputed } from '../types'
import { useGetTradeContext } from './useGetTradeContext'
import { TargetChainIdContext } from './useTargetChainIdContext'

export function useTradeApproveComputed(
    trade: TradeComputed<unknown> | null,
    provider?: TradeProvider,
    token?: FungibleTokenDetailed,
) {
    const { targetChainId: chainId } = TargetChainIdContext.useContainer()
    const context = useGetTradeContext(provider)

    return useMemo(() => {
        return {
            approveToken:
                token?.type === EthereumTokenType.ERC20
                    ? createERC20Token(chainId, token.address, token.decimals, token.name, token.symbol)
                    : null,
            approveAmount: trade ? trade.inputAmount : ZERO,
            approveAddress: (() => {
                if (context?.TYPE === TradeProvider.ZRX)
                    return trade?.trade_ ? (trade.trade_ as SwapQuoteResponse).allowanceTarget : ''
                return context?.ROUTER_CONTRACT_ADDRESS ?? ''
            })(),
        }
    }, [chainId, trade, token, context])
}
