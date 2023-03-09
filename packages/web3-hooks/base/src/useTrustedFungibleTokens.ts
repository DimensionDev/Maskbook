import { useMemo } from 'react'
import { useSubscription } from 'use-subscription'
import { EMPTY_ARRAY, type NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3State } from './useWeb3State.js'

export function useTrustedFungibleTokens<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    schemaType?: Web3Helper.SchemaTypeScope<S, T>,
    chainId?: Web3Helper.ChainIdScope<S, T>,
) {
    const { Token } = useWeb3State(pluginID)
    const fungibleTokens = useSubscription(Token?.trustedFungibleTokens ?? EMPTY_ARRAY)
    return useMemo<Array<Web3Helper.FungibleTokenScope<S, T>>>(() => {
        return fungibleTokens
            .filter((x) => (schemaType ? x.schema === schemaType : true))
            .filter((x) => (chainId ? x.chainId === chainId : true))
    }, [schemaType, fungibleTokens, chainId])
}
