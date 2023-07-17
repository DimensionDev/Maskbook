import { useSubscription } from 'use-subscription'
import { EMPTY_ARRAY } from '@masknet/shared-base'
import { Web3State } from '@masknet/web3-providers'

export function useContacts() {
    return useSubscription(Web3State.state.AddressBook?.contacts ?? EMPTY_ARRAY)
}
