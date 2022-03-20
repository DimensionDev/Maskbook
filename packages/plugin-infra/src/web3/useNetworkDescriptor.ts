import type { NetworkPluginID } from '..'
import { useNetworkType } from './useNetworkType'
import { usePluginIDContext } from './Context'
import { getPluginDefine } from '../manager/store'

export function useNetworkDescriptor(
    expectedPluginID?: NetworkPluginID,
    expectedChainIdOrNetworkTypeOrID?: number | string,
) {
    const pluginID = usePluginIDContext(expectedPluginID)
    const networkType = useNetworkType(pluginID)

    return getPluginDefine(pluginID)?.declareWeb3Networks?.find((x) =>
        [x.chainId, x.type, x.ID].includes(expectedChainIdOrNetworkTypeOrID ?? networkType ?? ''),
    )
}
