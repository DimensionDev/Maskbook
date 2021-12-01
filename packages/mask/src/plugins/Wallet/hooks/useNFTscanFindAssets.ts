import { WalletRPC } from '../messages'
import { useAsyncRetry } from 'react-use'

export function useNFTscanFindAssets(account: string, disabled = false) {
    return useAsyncRetry(async () => {
        if (!account || disabled) return null
        return WalletRPC.nftscanFindAssets(account)
    }, [account, disabled])
}
