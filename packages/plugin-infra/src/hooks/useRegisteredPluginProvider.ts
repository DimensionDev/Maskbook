import { useRegisteredPlugin } from '.'

export function useRegisteredPluginProvider(pluginID: string, providerTypeOrID?: string) {
    return useRegisteredPlugin(pluginID)?.declareWeb3Providers?.find(
        (x) => x.ID === providerTypeOrID || x.type === providerTypeOrID,
    )
}
