import type { NetworkPluginID } from '..'
import { usePluginWeb3StateContext } from './Context'

export function useWallets(pluginID?: NetworkPluginID) {
    return usePluginWeb3StateContext(pluginID).wallets
}
