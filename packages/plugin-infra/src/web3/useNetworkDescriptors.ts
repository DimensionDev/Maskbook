import { useCurrentWeb3NetworkPluginID } from '.'
import { getPluginDefine } from '../entry'

export function useNetworkDescriptors(expectedPluginID?: string) {
    const pluginID = useCurrentWeb3NetworkPluginID()
    return getPluginDefine(expectedPluginID ?? pluginID)?.declareWeb3Networks ?? []
}
