import { Plugin, useActivatedPluginsDashboard, useActivatedPluginsSNSAdaptor } from '..'

export function useAllPluginsWeb3State() {
    const pluginsSNSAdaptor = useActivatedPluginsSNSAdaptor()
    const pluginsDashboard = useActivatedPluginsDashboard()
    return [...pluginsSNSAdaptor, ...pluginsDashboard].reduce<Record<string, Plugin.Shared.Web3State>>((accumulator, current) => {
        if (current.Web3State) {
            accumulator[current.ID] = current.Web3State
        }
        return accumulator
    }, {})
}
