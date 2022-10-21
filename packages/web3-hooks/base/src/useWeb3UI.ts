import type { NetworkPluginID } from '@masknet/shared-base'
import { useActivatedPluginWeb3UI } from '@masknet/plugin-infra'
import type { Web3Helper } from '@masknet/web3-helpers'
import { usePluginIDContext } from './useContext.js'

export function useWeb3UI<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    expectedPluginID?: T,
) {
    const { pluginID } = usePluginIDContext(expectedPluginID) as T
    return useActivatedPluginWeb3UI(pluginID) as Web3Helper.Web3UIScope<S, T>
}
