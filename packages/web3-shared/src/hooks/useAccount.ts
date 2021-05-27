import { useWallet } from '.'

/**
 * Get the address of the default wallet
 */
// TODO: why use empty string?
export function useAccount() {
    const wallet = useWallet()
    return wallet?.address ?? ''
}
