import { useMemo } from 'react'
import { useChainId } from '../../../../web3/hooks/useChainId'
import type { FungibleTokenDetailed } from '../../../../web3/types'
import { toUniswapToken } from '../../helpers'

export function useUniswapToken(token?: FungibleTokenDetailed) {
    const chainId = useChainId()
    return useMemo(() => {
        if (!token) return
        return toUniswapToken(chainId, token)
    }, [chainId, JSON.stringify(token)])
}
