import type { NetworkPluginID } from '@masknet/shared-base'
import { useActivatedPluginWeb3UI } from '@masknet/plugin-infra'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useNetworkContext } from './useContext.js'

export function useWeb3UI<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    expectedPluginID?: T,
) {
    const { pluginID } = useNetworkContext<T>(expectedPluginID)
    return useActivatedPluginWeb3UI(pluginID) as Web3Helper.Web3UIScope<S, T>
}
