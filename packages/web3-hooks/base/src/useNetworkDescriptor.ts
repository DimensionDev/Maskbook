import type { NetworkPluginID } from '@masknet/shared-base'
import { getRegisteredWeb3Networks } from '@masknet/web3-providers'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useNetworkContext } from './useContext.js'
import { useMemo } from 'react'

/**
 * Get built in declared network descriptor
 * @param expectedPluginID
 * @param expectedChainIdOrNetworkTypeOrID
 * @returns
 */
export function useNetworkDescriptor<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    expectedPluginID?: T,
    expectedChainIdOrNetworkTypeOrID?: string | number,
): Web3Helper.NetworkDescriptorScope<S, T> | undefined {
    const { pluginID } = useNetworkContext(expectedPluginID)
    const { networkType, chainId } = useChainContext()
    const identity = expectedChainIdOrNetworkTypeOrID || networkType || chainId || ''
    return useMemo(() => {
        return getRegisteredWeb3Networks(pluginID).find((x) => [x.chainId, x.type, x.ID].includes(identity))
    }, [pluginID, identity])
}
