import type { NetworkPluginID } from '../web3-types'
import { usePluginWeb3StateContext } from './Context'

export function useNetworkType<T extends string>(pluginID?: NetworkPluginID) {
    return usePluginWeb3StateContext(pluginID).networkType as T
}
