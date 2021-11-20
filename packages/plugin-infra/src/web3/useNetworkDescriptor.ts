import type { NetworkPluginID } from '..'
import { useNetworkType } from './useNetworkType'
import { usePluginIDContext } from './Context'
import { getPluginDefine } from '../manager/store'

export function useNetworkDescriptor(expectedNetworkTypeOrID?: string, expectedPluginID?: NetworkPluginID) {
    const pluginID = usePluginIDContext()
    const networkType = useNetworkType()

    return getPluginDefine(expectedPluginID ?? pluginID)?.declareWeb3Networks?.find((x) =>
        [x.type, x.ID].includes(expectedNetworkTypeOrID ?? networkType ?? ''),
    )
}
