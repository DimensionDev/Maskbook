import type { NetworkPluginID } from '@masknet/shared-base'
import { useActivatedPluginWeb3State } from '@masknet/plugin-infra'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useNetworkContext } from './useContext.js'

export function useWeb3State<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    expectedPluginID?: T,
) {
    const { pluginID } = useNetworkContext<T>(expectedPluginID)
    return useActivatedPluginWeb3State(pluginID) as Web3Helper.Web3StateScope<S, T>
}
