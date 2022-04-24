import { useSubscription } from 'use-subscription'
import { useWeb3State } from '../entry-web3'
import { UNDEIFNED } from '../utils/subscription'
import type { NetworkPluginID } from '../web3-types'

export function useAccount<T extends NetworkPluginID>(pluginID?: T, expectedAccount?: string) {
    const { Provider } = useWeb3State<T>(pluginID)
    const defautlAccount = useSubscription(Provider?.account ?? UNDEIFNED)
    return expectedAccount ?? defautlAccount ?? ''
}
