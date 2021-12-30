import { usePluginIDContext } from '.'
import { getPluginDefine } from '..'

export function useProviderDescriptors(expectedPluginID?: string) {
    const pluginID = usePluginIDContext()
    return getPluginDefine(expectedPluginID ?? pluginID)?.declareWeb3Providers ?? []
}
