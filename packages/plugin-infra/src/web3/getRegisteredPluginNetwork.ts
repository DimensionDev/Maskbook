import { getPluginDefine } from '../manager/store'

export function getRegisteredPluginNetwork(pluginID: string, networkTypeOrID?: string) {
    return getPluginDefine(pluginID)?.declareWeb3Networks?.find(
        (x) => x.type === networkTypeOrID || x.ID === networkTypeOrID,
    )
}
