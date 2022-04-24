import { useActivatedPluginsDashboard } from '../manager/dashboard'
import { useActivatedPluginsSNSAdaptor } from '../manager/sns-adaptor'
import type { Web3Helper } from '../web3-helpers'
import type { NetworkPluginID } from '../web3-types'

export function useAllPluginsWeb3State<T extends NetworkPluginID>() {
    const pluginsSNSAdaptor = useActivatedPluginsSNSAdaptor('any')
    const pluginsDashboard = useActivatedPluginsDashboard()

    return [...pluginsSNSAdaptor, ...pluginsDashboard].reduce<Record<string, Web3Helper.Web3State<T>[]>>(
        (accumulator, current) => {
            if (current.Web3State) {
                accumulator[current.ID] = current.Web3State
            }
            return accumulator
        },
        {},
    )
}
