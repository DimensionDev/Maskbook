import type { NetworkPluginID } from '../web3-types'
import { usePluginWeb3StateContext } from './Context'

export function useWallets(type?: string, pluginID?: NetworkPluginID) {
    return usePluginWeb3StateContext(pluginID).wallets
}
