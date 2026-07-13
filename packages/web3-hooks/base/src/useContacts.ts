import { EMPTY_LIST, type NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'
import { useSubscriptionMaybe } from '@masknet/shared-base-ui'

export function useContacts(pluginID?: NetworkPluginID) {
    const { AddressBook } = useWeb3State(pluginID)
    return useSubscriptionMaybe(AddressBook?.contacts, EMPTY_LIST)
}
