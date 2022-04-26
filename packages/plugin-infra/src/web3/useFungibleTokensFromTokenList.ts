import { Subscription, useSubscription } from 'use-subscription'
import type { FungibleToken, NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3State } from './useWeb3State'
import { EMPTY_ARRAY } from '../utils/subscription'

export function useFungibleTokensFromTokenList<T extends NetworkPluginID>(pluginID?: T) {
    const { TokenList } = useWeb3State(pluginID)
    return useSubscription(
        (TokenList?.fungibleTokens ?? EMPTY_ARRAY) as Subscription<
            FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>[]
        >,
    )
}
