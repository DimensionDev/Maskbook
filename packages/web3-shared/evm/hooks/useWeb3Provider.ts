import type { HttpProvider } from 'web3-core'
import { useSubscription } from 'use-subscription'
import { useWeb3Context } from '../context'

export function useWeb3Provider() {
    const _ = useWeb3Context()
    const provider = useSubscription(_.provider)
    return provider as HttpProvider
}
