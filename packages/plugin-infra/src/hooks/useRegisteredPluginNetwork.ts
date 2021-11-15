import { useRegisteredPlugin } from '.'

export function useRegisteredPluginNetwork(pluginID: string, networkTypeOrID?: string) {
    return useRegisteredPlugin(pluginID)?.declareWeb3Networks?.find(
        (x) => x.type === networkTypeOrID || x.ID === networkTypeOrID,
    )
}
