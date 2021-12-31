import { useActivatedPluginsDashboard } from '../manager/dashboard'
import { useActivatedPluginsSNSAdaptor } from '../manager/sns-adaptor'
import type { Web3Plugin } from '../web3-types'

export function useAllPluginsWeb3State() {
    const pluginsSNSAdaptor = useActivatedPluginsSNSAdaptor('any')
    const pluginsDashboard = useActivatedPluginsDashboard()

    return [...pluginsSNSAdaptor, ...pluginsDashboard].reduce<
        Record<string, Web3Plugin.ObjectCapabilities.Capabilities>
    >((accumulator, current) => {
        if (current.Web3State) {
            accumulator[current.ID] = current.Web3State
        }
        return accumulator
    }, {})
}
