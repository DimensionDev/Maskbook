import type { NetworkPluginID } from '@masknet/web3-shared-base'
import { useActivatedPluginsDashboard } from '../manager/dashboard'
import { useActivatedPluginsSNSAdaptor } from '../manager/sns-adaptor'
import type { Web3Helper } from '../web3-helpers'

export function useAllPluginsWeb3State<T extends NetworkPluginID>() {
    const pluginsSNSAdaptor = useActivatedPluginsSNSAdaptor('any')
    const pluginsDashboard = useActivatedPluginsDashboard()

    return [...pluginsSNSAdaptor, ...pluginsDashboard].reduce<Record<string, Web3Helper.Web3State<T>>>(
        (accumulator, current) => {
            const Web3State = current.Web3State as Web3Helper.Web3State<T> | undefined

            if (Web3State) {
                accumulator[current.ID] = Web3State
            }
            return accumulator
        },
        {},
    )
}
