import { useRegisteredPlugin } from '.'

export function useRegisteredPluginNetwork(pluginID: string, networkType?: string) {
    return useRegisteredPlugin(pluginID)?.networks?.find((x) => x.type === networkType)
}
