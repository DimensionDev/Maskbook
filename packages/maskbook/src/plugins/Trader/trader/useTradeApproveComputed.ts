import { useContext, useMemo } from 'react'
import { createERC20Token, EthereumTokenType, FungibleTokenDetailed, useChainId, ZERO } from '@masknet/web3-shared'
import { TradeProvider } from '@masknet/public-api'
import type { SwapQuoteResponse, TradeComputed } from '../types'
import { TradeContext } from './useTradeContext'

export function useTradeApproveComputed(trade: TradeComputed<unknown> | null, token?: FungibleTokenDetailed) {
    const chainId = useChainId()
    const context = useContext(TradeContext)

    return useMemo(() => {
        return {
            approveToken:
                token?.type === EthereumTokenType.ERC20
                    ? createERC20Token(
                          chainId,
                          token.address,
                          token.decimals ?? 0,
                          token.name ?? '',
                          token.symbol ?? '',
                      )
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
