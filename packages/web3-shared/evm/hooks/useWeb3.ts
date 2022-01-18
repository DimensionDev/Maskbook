import Web3 from 'web3'
import { useMemo } from 'react'
import { useWeb3Provider } from './useWeb3Provider'
import type { ChainId } from '../types'

export function useWeb3(chainId?: ChainId) {
    const provider = useWeb3Provider({
        chainId,
    })
    return useMemo(() => new Web3(provider), [provider])
}
