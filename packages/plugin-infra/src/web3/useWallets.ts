import { usePluginWeb3StateContext } from '../context'

export function useWallets(type?: string, pluginID?: string) {
    return usePluginWeb3StateContext(pluginID).wallets
}
