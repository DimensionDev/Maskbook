import { useNetworkType, usePluginIDContext } from '.'
import { getPluginDefine } from '..'

export function useNetworkDescriptor(expectedNetworkTypeOrID?: string, expectedPluginID?: string) {
    const pluginID = usePluginIDContext()
    const networkType = useNetworkType()

    return getPluginDefine(expectedPluginID ?? pluginID)?.declareWeb3Networks?.find((x) =>
        [x.type, x.ID].includes(expectedNetworkTypeOrID ?? networkType ?? ''),
    )
}
