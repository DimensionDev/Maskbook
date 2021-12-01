import { usePluginIDContext } from '.'
import { getPluginDefine } from '..'

export function useNetworkDescriptors(expectedPluginID?: string) {
    const pluginID = usePluginIDContext()
    return getPluginDefine(expectedPluginID ?? pluginID)?.declareWeb3Networks ?? []
}
