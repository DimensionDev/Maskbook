import { getManagedWallets } from '../../plugins/Wallet/wallet'
import type { WalletProvider } from './index'
export const provider: WalletProvider = {
    checkAvailability: () => Promise.resolve(true),
    async requestAccounts() {
        const wallets = await getManagedWallets()
        return wallets.wallets.map((x) => x.address)
    },
}
