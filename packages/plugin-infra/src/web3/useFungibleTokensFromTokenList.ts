import { Subscription, useSubscription } from 'use-subscription'
import type { FungibleToken, NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3State } from './useWeb3State'
import { EMPTY_ARRAY } from '../utils/subscription'
import { useEffect } from 'react'
import { useChainId } from './useChainId'

export function useFungibleTokensFromTokenList<T extends NetworkPluginID>(pluginID?: T) {
    type GetFungibleTokens = (
        chainId: Web3Helper.Definition[T]['ChainId'],
    ) => Promise<FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>>

    const chainId = useChainId(pluginID)
    const { TokenList } = useWeb3State(pluginID)

    useEffect(() => {
        ;(TokenList?.getFungibleTokens as GetFungibleTokens | undefined)?.(chainId)
    }, [chainId, TokenList])

    return useSubscription(
        (TokenList?.fungibleTokens ?? EMPTY_ARRAY) as Subscription<
            FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>[]
        >,
    )
}
