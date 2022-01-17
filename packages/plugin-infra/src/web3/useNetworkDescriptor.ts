import type { NetworkPluginID } from '..'
import { useNetworkType } from './useNetworkType'
import { usePluginIDContext } from './Context'
import { getPluginDefine } from '../manager/store'

export function useNetworkDescriptor(
    expectedChainIdOrNetworkTypeOrID?: number | string,
    expectedPluginID?: NetworkPluginID,
) {
    const pluginID = usePluginIDContext()
    const pid = expectedPluginID ?? pluginID
    const networkType = useNetworkType(pid)

    return getPluginDefine(pid)?.declareWeb3Networks?.find((x) =>
        [x.chainId, x.type, x.ID].includes(expectedChainIdOrNetworkTypeOrID ?? networkType ?? ''),
    )
}
