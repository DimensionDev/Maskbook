import type { HttpProvider } from 'web3-core'
import { useSubscription } from 'use-subscription'
import { useWeb3Context } from '../context'

export function useFortmaticProvider() {
    const _ = useWeb3Context()
    const provider = useSubscription(_.fortmaticProvider)
    return provider as HttpProvider
}
