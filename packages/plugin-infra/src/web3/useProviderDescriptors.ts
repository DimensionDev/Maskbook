import { useCurrentWeb3NetworkPluginID } from '.'
import { getPluginDefine } from '..'

export function useProviderDescriptors(expectedPluginID?: string) {
    const pluginID = useCurrentWeb3NetworkPluginID()
    return getPluginDefine(expectedPluginID ?? pluginID)?.declareWeb3Providers ?? []
}
