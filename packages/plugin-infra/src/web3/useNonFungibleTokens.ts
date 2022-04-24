import { useWeb3State, NetworkPluginID } from '../entry-web3'
import { EMPTY_ARRAY } from '../utils/subscription'
import { useSubscription } from 'use-subscription'

export function useNonFungibleTokens<T extends NetworkPluginID>(pluginID?: T) {
    const { Token } = useWeb3State(pluginID)
    // @ts-ignore
    return useSubscription(Token?.nonFungibleTokens ?? EMPTY_ARRAY)
}
