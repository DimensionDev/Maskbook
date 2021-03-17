import { useAsyncRetry } from 'react-use'
import { WalletRPC } from '../messages'
import type { AssetProvider } from '../types'

export function useCollectibles(address: string, provider: AssetProvider) {
    return useAsyncRetry(async () => {
        if (!address) return []
        // return WalletRPC.getAssetsListNFT(address.toLowerCase(), provider)
        // return WalletRPC.getAssetsListNFT('0x65c1b9ae4e4d8dcccfd3dc41b940840fe8570f2a'.toLowerCase(), provider)
        return WalletRPC.getAssetsListNFT('0xa357a589a37cf7b6edb31b707e8ed3219c8249ac'.toLowerCase(), provider)
    }, [address, provider])
}
