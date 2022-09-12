import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers/index.js'
import { useWeb3State } from './useWeb3State.js'

export function useZeroAddress<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    options?: Web3Helper.Web3ConnectionOptionsScope<S, T>,
) {
    const { Others } = useWeb3State(pluginID)
    return Others?.getZeroAddress?.() ?? ''
}
