import { usePluginWeb3StateContext } from '../context'

export function useWallets(type?: string) {
    const { wallets } = usePluginWeb3StateContext()
    return wallets
}
