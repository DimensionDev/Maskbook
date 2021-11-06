import { useRegisteredPlugins } from '../manager/store'

export function useRegisteredPlugin(pluginID: string) {
    const plugins = useRegisteredPlugins()
    return plugins.find((x) => x.ID === pluginID)
}
