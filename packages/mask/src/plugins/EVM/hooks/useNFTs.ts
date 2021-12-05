import { useAsyncRetry } from 'react-use'
import { EVM_RPC } from '../messages'

export function useNFTs(account: string, disabled = false) {
    return useAsyncRetry(async () => {
        if (!account || disabled) return null
        return EVM_RPC.getNFTs(account)
    }, [account, disabled])
}
