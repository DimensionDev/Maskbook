import { useAsyncRetry } from 'react-use'
import { WalletRPC } from '../messages'
import type { AssetProvider } from '../types'

export function useCollectibles(address: string, provider: AssetProvider) {
    return useAsyncRetry(async () => {
        if (!address) return []
        // return WalletRPC.getAssetsListNFT(address.toLowerCase(), provider)
        return WalletRPC.getAssetsListNFT('0x0d09dC9a840B1b4ea25194998fD90bB50fC2008A'.toLowerCase(), provider)
    }, [address, provider])
}
