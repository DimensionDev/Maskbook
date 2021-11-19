import { useActivatedPluginsDashboard } from '../manager/dashboard'
import { useActivatedPluginsSNSAdaptor } from '../manager/sns-adaptor'
import type { Web3Plugin } from '../web3-types'

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
