import { useActivatedPluginsDashboard, useActivatedPluginsSNSAdaptor, Web3Plugin } from '..'

export function useAllPluginsWeb3State() {
    const pluginsSNSAdaptor = useActivatedPluginsSNSAdaptor()
    const pluginsDashboard = useActivatedPluginsDashboard()

    return [...pluginsSNSAdaptor, ...pluginsDashboard].reduce<
        Record<string, Web3Plugin.ObjectCapabilities.Capabilities>
    >((accumulator, current) => {
        accumulator[current.ID] = current.Web3State ?? {}
        return accumulator
    }, {})
}
