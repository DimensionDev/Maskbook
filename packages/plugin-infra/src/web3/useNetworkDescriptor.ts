import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useNetworkType } from './useNetworkType'
import { useCurrentWeb3NetworkPluginID } from './Context'
import { getPluginDefine } from '../manager/store'

export function useNetworkDescriptor<T extends NetworkPluginID>(
    expectedPluginID?: T,
    expectedChainIdOrNetworkTypeOrID?: string | number,
) {
    const pluginID = useCurrentWeb3NetworkPluginID(expectedPluginID)
    const networkType = useNetworkType(pluginID)

    return getPluginDefine(pluginID)?.declareWeb3Networks?.find((x) =>
        [x.chainId, x.type, x.ID].includes(expectedChainIdOrNetworkTypeOrID ?? networkType ?? ''),
    )
}
