import { useSubscription } from 'use-subscription'
import { EMPTY_ARRAY } from '@masknet/shared-base'
import { Web3State } from '@masknet/web3-providers'

export function useNetworks() {
    return useSubscription(Web3State.state.Network?.networks ?? EMPTY_ARRAY)
}
