import Web3 from 'web3'
import { useMemo } from 'react'
import { useWeb3Provider } from './useWeb3Provider'
import type { RequestOptions, SendOverrides } from '../types'

export function useWeb3(overrides?: SendOverrides, options?: RequestOptions) {
    const provider = useWeb3Provider(overrides, options)
    return useMemo(() => new Web3(provider), [provider])
}
