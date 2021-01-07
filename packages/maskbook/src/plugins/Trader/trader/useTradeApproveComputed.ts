import { useMemo } from 'react'
import { useChainId } from '../../../web3/hooks/useChainState'
import { createEtherToken, createERC20Token } from '../../../web3/helpers'
import type { TradeComputed } from '../types'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../web3/types'

export function useTradeApproveComputed(
    trade: TradeComputed<unknown> | null,
    token?: EtherTokenDetailed | ERC20TokenDetailed,
) {
    const chainId = useChainId()
    return useMemo(() => {
        if (!trade || !token)
            return {
                approveToken: undefined,
                approveAmount: '0',
            }
        return {
            approveToken:
                token.name === 'ETH'
                    ? createEtherToken(chainId)
                    : createERC20Token(
                          chainId,
                          token.address,
                          token.decimals ?? 0,
                          token.name ?? '',
                          token.symbol ?? '',
                      ),
            approveAmount: trade.maximumSold.toFixed(),
        }
    }, [trade, token, chainId])
}
