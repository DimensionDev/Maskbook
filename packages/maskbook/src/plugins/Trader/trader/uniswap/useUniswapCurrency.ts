import { useMemo } from 'react'
import { useChainId } from '../../../../web3/hooks/useBlockNumber'
import type { ERC20TokenDetailed, NativeTokenDetailed } from '../../../../web3/types'
import { toUniswapCurrency } from '../../helpers'

export function useUniswapCurrency(token?: NativeTokenDetailed | ERC20TokenDetailed) {
    const chainId = useChainId()
    return useMemo(() => {
        if (!token) return
        return toUniswapCurrency(chainId, token)
    }, [chainId, JSON.stringify(token)])
}
