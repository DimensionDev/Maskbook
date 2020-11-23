import { useMemo } from 'react'
import { useChainId } from '../../../../web3/hooks/useChainState'
import type { ERC20TokenDetailed, EtherTokenDetailed } from '../../../../web3/types'
import { toUniswapCurrency } from '../../helpers'

export function useUniswapCurrency(token?: EtherTokenDetailed | ERC20TokenDetailed) {
    const chainId = useChainId()
    return useMemo(() => {
        if (!token) return
        return toUniswapCurrency(chainId, token)
    }, [chainId, JSON.stringify(token)])
}
