import { WalletRPC } from '../messages'
import { useAsyncRetry } from 'react-use'

export function useNFTscanFindAssets(account: string) {
    return useAsyncRetry(() => {
        return WalletRPC.nftscanFindAssets(account)
    }, [account])
}
