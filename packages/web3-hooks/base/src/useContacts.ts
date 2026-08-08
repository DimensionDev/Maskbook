import { EMPTY_LIST, type NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'
import { useSubscriptionMaybe } from '@masknet/shared-base-ui'
import type { Contact } from '@masknet/web3-shared-base'

export function useContacts(pluginID?: NetworkPluginID): Contact[] {
    const { AddressBook } = useWeb3State(pluginID)
    return useSubscriptionMaybe(AddressBook?.contacts, EMPTY_LIST)
}
