import { useSubscription } from 'use-subscription'
import { Web3State } from '@masknet/web3-providers'
import { EMPTY_ARRAY, EMPTY_LIST } from '@masknet/shared-base'

export function useWalletContacts() {
    return useSubscription(Web3State.state.AddressBook?.addressBook ?? EMPTY_ARRAY)
}
