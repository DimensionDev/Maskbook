import { useSubscription } from 'use-subscription'
import { EMPTY_ENTITY } from '@masknet/shared-base'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useWeb3State } from './useWeb3State.js'

export function useAddressBook<T extends NetworkPluginID>(pluginID?: T) {
    const { AddressBook } = useWeb3State(pluginID)
    return useSubscription(AddressBook?.addressBook ?? EMPTY_ENTITY)
}
