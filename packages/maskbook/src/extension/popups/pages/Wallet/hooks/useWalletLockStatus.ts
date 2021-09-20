import { useAsyncRetry } from 'react-use'
import { WalletRPC } from '../../../../../plugins/Wallet/messages'

export function useWalletLockStatus() {
    return useAsyncRetry(async () => {
        return false
        // const hasEncryptWallet = await WalletRPC.hasEncryptedWalletStore()
        // if (hasEncryptWallet) {
        //     const encryptWallet = await WalletRPC.getEncryptedWalletStore()
        //     if (encryptWallet.some) return !!encryptWallet.val
        //     return false
        // }
        // return false
    }, [])
}
