import { useSubscription } from 'use-subscription'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useWeb3State } from './useWeb3State.js'
import { EMPTY_OBJECT } from '../utils/subscription.js'

export function useAddressBook<T extends NetworkPluginID>(pluginID?: T) {
    const { AddressBook } = useWeb3State(pluginID)
    return useSubscription(AddressBook?.addressBook ?? EMPTY_OBJECT)
}
