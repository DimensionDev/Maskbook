import Web3 from 'web3'
import { useSubscription } from 'use-subscription'
import { useWeb3Provider } from '../context'
import { useMemo } from 'react'

export function useWeb3() {
    const _ = useWeb3Provider()
    const provider = useSubscription(_.provider)
    return useMemo(() => new Web3(provider), [])
}
