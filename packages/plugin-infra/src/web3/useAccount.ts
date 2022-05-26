import { useSubscription } from 'use-subscription'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useWeb3State } from './useWeb3State'
import { UNDEIFNED } from '../utils/subscription'
import { useCurrentWeb3NetworkAccount } from './Context'

export function useAccount<T extends NetworkPluginID>(pluginID?: T, expectedAccount?: string) {
    const { Provider } = useWeb3State<T>(pluginID)
    const currentAccount = useCurrentWeb3NetworkAccount(pluginID)
    const defautlAccount = useSubscription(Provider?.account ?? UNDEIFNED) ?? ''
    return expectedAccount ?? currentAccount ?? defautlAccount ?? ''
}
