import { useSubscription } from 'use-subscription'
import { useWeb3State } from '../entry-web3'
import { UNDEIFNED } from '../utils/subscription'
import type { NetworkPluginID } from '../web3-types'

export function useDomainBook<T extends NetworkPluginID>(pluginID?: T) {
    const { NameService } = useWeb3State(pluginID)
    return useSubscription(NameService?.domainBook ?? UNDEIFNED)
}
