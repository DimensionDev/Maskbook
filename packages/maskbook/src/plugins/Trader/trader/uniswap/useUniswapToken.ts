import { useMemo } from 'react'
import { useChainId } from '../../../../web3/hooks/useChainId'
import type { NativeTokenDetailed, ERC20TokenDetailed } from '../../../../web3/types'
import { toUniswapToken } from '../../helpers'

export function useUniswapToken(token?: NativeTokenDetailed | ERC20TokenDetailed) {
    const chainId = useChainId()
    return useMemo(() => {
        if (!token) return
        return toUniswapToken(chainId, token)
    }, [chainId, JSON.stringify(token)])
}
