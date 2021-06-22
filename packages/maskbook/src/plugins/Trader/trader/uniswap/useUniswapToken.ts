import { useMemo } from 'react'
import { useChainId } from '@masknet/web3-shared'
import type { FungibleTokenDetailed } from '@masknet/web3-shared'
import { toUniswapToken } from '../../helpers'

export function useUniswapToken(token?: FungibleTokenDetailed) {
    const chainId = useChainId()
    return useMemo(() => {
        if (!token) return
        return toUniswapToken(chainId, token)
    }, [chainId, JSON.stringify(token)])
}
