import { useSubscription } from 'use-subscription'
import { EMPTY_ARRAY, type NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'

export function useContacts<T extends NetworkPluginID = NetworkPluginID>(pluginID?: T) {
    const { AddressBook } = useWeb3State(pluginID)
    return useSubscription(AddressBook?.contacts ?? EMPTY_ARRAY)
}
