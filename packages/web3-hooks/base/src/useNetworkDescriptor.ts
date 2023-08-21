import type { NetworkPluginID } from '@masknet/shared-base'
import { getPluginDefine } from '@masknet/plugin-infra'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useChainContext, useNetworkContext } from './useContext.js'

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
    const { networkType } = useChainContext()

    return getPluginDefine(pluginID)?.declareWeb3Networks?.find((x) =>
        [x.chainId, x.type, x.ID].includes(expectedChainIdOrNetworkTypeOrID ?? networkType ?? ''),
    ) as Web3Helper.NetworkDescriptorScope<S, T> | undefined
}
