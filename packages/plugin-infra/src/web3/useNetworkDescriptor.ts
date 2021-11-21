import type { NetworkPluginID } from '..'
import { useNetworkType } from './useNetworkType'
import { usePluginIDContext } from './Context'
import { getPluginDefine } from '../manager/store'

export function useNetworkDescriptor(
    expectedChainIdOrNetworkTypeOrID?: number | string,
    expectedPluginID?: NetworkPluginID,
) {
    const pluginID = usePluginIDContext()
    const networkType = useNetworkType(expectedPluginID ?? pluginID)

    return getPluginDefine(expectedPluginID ?? pluginID)?.declareWeb3Networks?.find((x) =>
        [x.chainId, x.type, x.ID].includes(expectedChainIdOrNetworkTypeOrID ?? networkType ?? ''),
    )
}
