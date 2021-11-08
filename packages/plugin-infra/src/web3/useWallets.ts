import { useWeb3StateContext } from '.'

export function useWallets(type?: string) {
    const { wallets } = useWeb3StateContext()
    return wallets
}
