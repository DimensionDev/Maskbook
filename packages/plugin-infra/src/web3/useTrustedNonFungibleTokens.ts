import { useMemo } from 'react'
import { Subscription, useSubscription } from 'use-subscription'
import type { NetworkPluginID, NonFungibleToken } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3State } from './useWeb3State'
import { EMPTY_ARRAY } from '../utils/subscription'

export function useTrustedNonFungibleTokens<T extends NetworkPluginID>(
    pluginID?: T,
    schemaType?: Web3Helper.Definition[T]['SchemaType'],
) {
    const { Token } = useWeb3State(pluginID)
    const nonFungibleTokens = useSubscription(
        (Token?.nonFungibleTokens ?? EMPTY_ARRAY) as Subscription<
            NonFungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>[]
        >,
    )
    return useMemo(() => {
        return nonFungibleTokens.length && schemaType
            ? nonFungibleTokens.filter((x) => x.schema === schemaType)
            : nonFungibleTokens
    }, [schemaType, nonFungibleTokens])
}
