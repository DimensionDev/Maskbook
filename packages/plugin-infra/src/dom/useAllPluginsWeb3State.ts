import type { NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useActivatedPluginsDashboard } from '../manager/dashboard.js'
import { useActivatedPluginsSiteAdaptor } from '../manager/site-adaptor.js'

export function useAllPluginsWeb3State<T extends NetworkPluginID>() {
    const pluginsSNSAdaptor = useActivatedPluginsSiteAdaptor('any')
    const pluginsDashboard = useActivatedPluginsDashboard()
    const entries = [...pluginsSNSAdaptor, ...pluginsDashboard]
        .filter((definition) => definition.Web3State)
        .map((definition) => [definition.ID, definition.Web3State])
    return Object.fromEntries(entries) as Record<string, Web3Helper.Web3State<T>>
}
