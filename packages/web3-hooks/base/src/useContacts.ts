import { useSubscription } from 'use-subscription'
import { Web3State } from '@masknet/web3-providers'
import { EMPTY_ARRAY } from '@masknet/shared-base'

export function useContacts() {
    return useSubscription(Web3State.state.AddressBook?.contacts ?? EMPTY_ARRAY)
}
