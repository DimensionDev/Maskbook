import type { NetworkPluginID } from '@masknet/shared-base'
import { getPluginDefine } from '@masknet/plugin-infra'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useNetworkType } from './useNetworkType.js'
import { usePluginContext } from './useContext.js'

export function useNetworkDescriptor<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    expectedPluginID?: T,
    expectedChainIdOrNetworkTypeOrID?: string | number,
) {
    const { pluginID } = usePluginContext(expectedPluginID)
    const networkType = useNetworkType(pluginID)

    return getPluginDefine(pluginID)?.declareWeb3Networks?.find((x) =>
        [x.chainId, x.type, x.ID].includes(expectedChainIdOrNetworkTypeOrID ?? networkType ?? ''),
    ) as Web3Helper.NetworkDescriptorScope<S, T> | undefined
}
