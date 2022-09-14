import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useNetworkType } from './useNetworkType.js'
import { useCurrentWeb3NetworkPluginID } from './Context.js'
import { getPluginDefine } from '../manager/store.js'
import type { Web3Helper } from '../web3-helpers/index.js'
import type { PluginID } from '../types.js'

export function useNetworkDescriptor<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    expectedPluginID?: T,
    expectedChainIdOrNetworkTypeOrID?: string | number,
) {
    const pluginID = useCurrentWeb3NetworkPluginID(expectedPluginID)
    const networkType = useNetworkType(pluginID)

    return getPluginDefine(pluginID as unknown as PluginID)?.declareWeb3Networks?.find((x) =>
        [x.chainId, x.type, x.ID].includes(expectedChainIdOrNetworkTypeOrID ?? networkType ?? ''),
    ) as Web3Helper.NetworkDescriptorScope<S, T> | undefined
}
