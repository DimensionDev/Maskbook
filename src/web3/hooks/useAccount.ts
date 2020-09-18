import { useMemo } from 'react'
import { useWallets } from '../../plugins/shared/useWallet'

/**
 * Get the address of the default wallet
 */
export function useAccount() {
    const { data: wallets = [] } = useWallets()
    return useMemo(() => {
        const defaultWallet = wallets.length ? wallets.find((x) => x._wallet_is_default) ?? wallets[0] : null
        return defaultWallet?.address ?? ''
    }, [wallets?.map((x) => x.address).join()])
}
