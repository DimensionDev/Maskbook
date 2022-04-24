import { useSubscription } from 'use-subscription'
import { useWeb3State } from '../entry-web3'
import { EMPTY_OBJECT } from '../utils/subscription'
import type { NetworkPluginID } from '../web3-types'

export function useAddressBook<T extends NetworkPluginID>(pluginID?: T) {
    const { AddressBook } = useWeb3State(pluginID)
    return useSubscription(AddressBook?.addressBook ?? EMPTY_OBJECT)
}
