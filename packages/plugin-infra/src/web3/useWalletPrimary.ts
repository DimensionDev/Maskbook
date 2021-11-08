import { usePluginWeb3StateContext } from '../context'

export function useWalletPrimary() {
    const { walletPrimary } = usePluginWeb3StateContext()
    return walletPrimary
}
