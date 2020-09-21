import { useComputedTrade } from './useComputedTrade'
import { useMemo } from 'react'
import type { Trade, Token as UniswapToken } from '@uniswap/sdk'
import { createERC20Token, createEetherToken } from '../helpers'
import { useChainId } from '../../../web3/hooks/useChainId'

export function useComputedApprove(trade: Trade | null) {
    const chainId = useChainId()
    const computedTrade = useComputedTrade(trade)

    return useMemo(() => {
        const inputToken = trade?.inputAmount.currency as UniswapToken | undefined
        if (!inputToken)
            return {
                approveToken: undefined,
                approveAmount: '0',
            }
        return {
            approveToken:
                inputToken.name === 'ETH'
                    ? createEetherToken(chainId)
                    : createERC20Token(
                          chainId,
                          inputToken.address,
                          inputToken.decimals,
                          inputToken.name ?? '',
                          inputToken.symbol ?? '',
                      ),
            approveAmount: computedTrade?.maximumSold.raw.toString(),
        }
    }, [trade, chainId])
}
