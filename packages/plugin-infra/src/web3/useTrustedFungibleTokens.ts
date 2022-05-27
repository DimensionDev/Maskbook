import { useMemo } from 'react'
import { Subscription, useSubscription } from 'use-subscription'
import type { FungibleToken, NetworkPluginID } from '@masknet/web3-shared-base'
import { EMPTY_ARRAY } from '../utils/subscription'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3State } from './useWeb3State'

export function useTrustedFungibleTokens<T extends NetworkPluginID>(
    pluginID?: T,
    schemaType?: Web3Helper.Definition[T]['SchemaType'],
) {
    const { Token } = useWeb3State(pluginID)
    const fungibleTokens = useSubscription(
        (Token?.trustedFungibleTokens ?? EMPTY_ARRAY) as Subscription<
            Array<FungibleToken<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>>
        >,
    )
    return useMemo(() => {
        return fungibleTokens.length && schemaType
            ? fungibleTokens.filter((x) => x.schema === schemaType)
            : fungibleTokens
    }, [schemaType, fungibleTokens])
}
