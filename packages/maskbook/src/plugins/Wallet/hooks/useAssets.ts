import { useAsyncRetry } from 'react-use'
import { WalletRPC } from '../messages'

export function useAssets(address: string) {
    return useAsyncRetry(async () => {
        if (!address) return []
        return WalletRPC.getAssetsList(address.toLowerCase())
    }, [address])
}
