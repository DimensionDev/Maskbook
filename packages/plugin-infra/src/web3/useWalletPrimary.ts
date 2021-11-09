import { usePluginWeb3StateContext } from '../context'

export function useWalletPrimary(pluginID?: string) {
    return usePluginWeb3StateContext(pluginID).walletPrimary
}
