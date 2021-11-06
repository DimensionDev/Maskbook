import { useRegisteredPlugin } from './'

export function useRegisteredPluginProvider(pluginID: string, providerID: string) {
    return useRegisteredPlugin(pluginID)?.providers?.find((x) => x.ID === providerID)
}
