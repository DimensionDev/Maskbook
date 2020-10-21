import { useSelectedWallet } from '../../plugins/Wallet/hooks/useWallet'

/**
 * Get the address of the default wallet
 */
export function useAccount() {
    const wallet = useSelectedWallet()
    return wallet?.address ?? ''
}
