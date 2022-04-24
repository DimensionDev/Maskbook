import { useWeb3State, NetworkPluginID } from '../entry-web3'
import { EMPTY_ARRAY } from '../utils/subscription'
import { useSubscription } from 'use-subscription'

export function useFungibleTokens<T extends NetworkPluginID>(pluginID?: T) {
    const { Token } = useWeb3State(pluginID)
    // @ts-ignore
    return useSubscription(Token?.fungibleTokens ?? EMPTY_ARRAY)
}
