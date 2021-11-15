import { useActivatedPluginsDashboard, useActivatedPluginsSNSAdaptor, Web3Plugin } from '..'

export function useAllPluginsWeb3State() {
    const pluginsSNSAdaptor = useActivatedPluginsSNSAdaptor()
    const pluginsDashboard = useActivatedPluginsDashboard()
    type T = Record<string, Web3Plugin.ObjectCapabilities.Capabilities>

    return [...pluginsSNSAdaptor, ...pluginsDashboard].reduce<T>((accumulator, current) => {
        if (current.Web3State) {
            accumulator[current.ID] = current.Web3State
        }
        return accumulator
    }, {})
}
