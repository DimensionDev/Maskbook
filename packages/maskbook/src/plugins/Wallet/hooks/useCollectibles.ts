import { useAsyncRetry } from 'react-use'
import { WalletRPC } from '../messages'
import type { AssetProvider } from '../types'

export function useCollectibles(address: string, provider: AssetProvider) {
    return useAsyncRetry(async () => {
        if (!address) return []
        return WalletRPC.getAssetsListNFT(address.toLowerCase(), provider)
    }, [address, provider])
}
