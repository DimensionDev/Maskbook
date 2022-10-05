import { useSubscription } from 'use-subscription'
import type {} from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { EMPTY_ENTRY } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'

export function useAddressBook<T extends NetworkPluginID>(pluginID?: T) {
    const { AddressBook } = useWeb3State(pluginID)
    return useSubscription(AddressBook?.addressBook ?? EMPTY_ENTRY)
}
