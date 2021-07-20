import Web3 from 'web3'
import { useMemo } from 'react'
import { useSubscription } from 'use-subscription'
import { useWeb3Context } from '../context'

export function useWeb3() {
    const _ = useWeb3Context()
    const provider = useSubscription(_.provider)
    return useMemo(() => new Web3(provider), [provider])
}
