import { useActivatedPluginsDashboard } from '../manager/dashboard'
import { useActivatedPluginsSNSAdaptor } from '../manager/sns-adaptor'
import type { Web3Plugin } from '../web3-types'

type Capabilities = Web3Plugin.ObjectCapabilities.Capabilities

export function useAllPluginsWeb3State() {
    const pluginsSNSAdaptor = useActivatedPluginsSNSAdaptor('any')
    const pluginsDashboard = useActivatedPluginsDashboard()
    const entries = [...pluginsSNSAdaptor, ...pluginsDashboard]
        .filter((definition) => definition.Web3State)
        .map((definiton): [string, Capabilities] => [definiton.ID, definiton.Web3State!])
    return Object.fromEntries(entries) as Record<string, Capabilities>
}
