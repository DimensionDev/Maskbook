import { useSubscription } from 'use-subscription'
import { useWeb3State, NetworkPluginID } from '../entry-web3'
import { EMPTY_ARRAY } from '../utils/subscription'

export function useNonFungibleTokenList<T extends NetworkPluginID>(pluginID?: T) {
    const { TokenList } = useWeb3State(pluginID)
    // @ts-ignore
    return useSubscription(TokenList?.nonFungibleTokens ?? EMPTY_ARRAY)
}
