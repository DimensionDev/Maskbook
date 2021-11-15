import { getPluginDefine } from '../manager/store'
export function getRegisteredPluginProvider(pluginID: string, providerTypeOrID?: string) {
    return getPluginDefine(pluginID)?.declareWeb3Providers?.find(
        (x) => x.ID === providerTypeOrID || x.type === providerTypeOrID,
    )
}
