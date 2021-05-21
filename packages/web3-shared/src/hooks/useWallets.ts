import { useSubscription } from 'use-subscription'
import { WalletProvider } from '../types'
import { isSameAddress } from '../utils'
import { useWeb3Context } from './context'
export interface Wallet {
    /** ethereum hex address */
    address: string
    /** User define wallet name. Default address.prefix(6) */
    name: string | null
    hasPrivateKey: boolean
}
export function useWallets(expectedProvider?: WalletProvider) {
    const context = useWeb3Context()
    const wallets = useSubscription(context.wallets)
    const selectedWalletProvider = useSubscription(context.walletProvider)
    if (expectedProvider === WalletProvider.Maskbook) return wallets.filter((x) => x.hasPrivateKey)
    if (expectedProvider === selectedWalletProvider)
        return wallets.filter((x) => isSameAddress(x.address, selectedWalletProvider))
    if (expectedProvider) return []
    return wallets
}
