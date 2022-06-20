import { useMemo } from 'react'
import { useSubscription } from 'use-subscription'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { EMPTY_ARRAY } from '../utils/subscription'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3State } from './useWeb3State'

export function useBlockedFungibleTokens<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    schemaType?: Web3Helper.SchemaTypeScope<S, T>,
) {
    const { Token } = useWeb3State(pluginID)
    const fungibleTokens = useSubscription(Token?.blockedFungibleTokens ?? EMPTY_ARRAY)
    return useMemo<Array<Web3Helper.FungibleTokenScope<S, T>>>(() => {
        return fungibleTokens.length && schemaType
            ? fungibleTokens.filter((x) => x.schema === schemaType)
            : fungibleTokens
    }, [schemaType, fungibleTokens])
}
