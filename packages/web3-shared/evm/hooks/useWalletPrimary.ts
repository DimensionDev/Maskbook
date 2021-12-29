import { useWeb3StateContext } from '../context'

export function useWalletPrimary() {
    const { walletPrimary } = useWeb3StateContext()
    return walletPrimary
}
