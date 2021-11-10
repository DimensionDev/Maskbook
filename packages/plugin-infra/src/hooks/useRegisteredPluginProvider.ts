import { useRegisteredPlugin } from '.'

export function useRegisteredPluginProvider(pluginID: string, providerTypeOrID?: string) {
    return useRegisteredPlugin(pluginID)?.providers?.find(
        (x) => x.ID === providerTypeOrID || x.type === providerTypeOrID,
    )
}
