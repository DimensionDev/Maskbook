import { useWeb3StateContext } from '.'

export function useWalletPrimary() {
    const { walletPrimary } = useWeb3StateContext()
    return walletPrimary
}
