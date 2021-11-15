import { usePluginWeb3StateContext } from './Context'

export function useWallets(type?: string, pluginID?: string) {
    return usePluginWeb3StateContext(pluginID).wallets
}
