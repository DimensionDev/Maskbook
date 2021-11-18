import { usePluginWeb3StateContext } from './Context'

export function useWalletPrimary(pluginID?: string) {
    return usePluginWeb3StateContext(pluginID).walletPrimary
}
