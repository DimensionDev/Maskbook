import type { NetworkPluginID } from '../web3-types'
import { usePluginWeb3StateContext } from './Context'

export function useWalletPrimary(pluginID?: NetworkPluginID) {
    return usePluginWeb3StateContext(pluginID).walletPrimary
}
