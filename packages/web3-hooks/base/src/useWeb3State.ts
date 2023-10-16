import type { NetworkPluginID } from '@masknet/shared-base'
import { getActivatedPluginWeb3State } from '@masknet/web3-providers'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useNetworkContext } from './useContext.js'

export function useWeb3State<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    expectedPluginID?: T,
): Web3Helper.Web3StateScope<S, T> {
    const { pluginID } = useNetworkContext<T>(expectedPluginID)
    return getActivatedPluginWeb3State(pluginID)
}
