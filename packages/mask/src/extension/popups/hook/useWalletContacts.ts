import { Web3State } from '@masknet/web3-providers'
import { useSubscription } from 'use-subscription'
import { EMPTY_LIST, UNDEFINED } from '@masknet/shared-base'

export function useWalletContacts() {
    return useSubscription(Web3State.state.AddressBook?.addressBook ?? UNDEFINED) ?? EMPTY_LIST
}
