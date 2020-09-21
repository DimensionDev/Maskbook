import { useDefaultWallet } from '../../plugins/Wallet/hooks/useWallet'

/**
 * Get the address of the default wallet
 */
export function useAccount() {
    const { data: wallet } = useDefaultWallet()
    return wallet?.address
}
