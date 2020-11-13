import { useWallet } from '../../plugins/Wallet/hooks/useWallet'

/**
 * Get the address of the default wallet
 */
export function useAccount() {
    const wallet = useWallet()
    return wallet?.address ?? ''
}
