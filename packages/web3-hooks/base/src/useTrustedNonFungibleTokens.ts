import { useMemo } from 'react'
import { useSubscription } from 'use-subscription'

import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { EMPTY_ARRAY } from '@masknet/shared-base'
import { useWeb3State } from './useWeb3State.js'

export function useTrustedNonFungibleTokens<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    schemaType?: Web3Helper.SchemaTypeScope<S, T>,
    chainId?: Web3Helper.ChainIdScope<S, T>,
) {
    const { Token } = useWeb3State(pluginID)
    const nonFungibleTokens = useSubscription(Token?.trustedNonFungibleTokens ?? EMPTY_ARRAY)
    return useMemo<Array<Web3Helper.NonFungibleTokenScope<S, T>>>(() => {
        return nonFungibleTokens
            .filter((x) => (schemaType ? x.schema === schemaType : true))
            .filter((x) => (chainId ? x.chainId === chainId : true))
    }, [schemaType, nonFungibleTokens, chainId])
}
