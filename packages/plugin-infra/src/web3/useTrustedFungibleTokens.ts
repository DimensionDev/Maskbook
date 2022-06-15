import { useMemo } from 'react'
import { useSubscription } from 'use-subscription'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { EMPTY_ARRAY } from '../utils/subscription'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3State } from './useWeb3State'

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
