import { useAsyncRetry } from 'react-use'
import { EVM_RPC } from '../messages'

export function useHistory(address?: string, tokenId?: string) {
    return useAsyncRetry(async () => {
        if (!address || !tokenId) return
        return EVM_RPC.getHistory(address, tokenId)
    }, [address, tokenId])
}
