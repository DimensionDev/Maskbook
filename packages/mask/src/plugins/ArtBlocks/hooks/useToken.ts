import { useAsyncRetry } from 'react-use'
import { useChainId } from '@masknet/web3-shared-evm'
import { fetchToken } from '../apis'

export function useFetchToken(tokenId: number) {
    const chainId = useChainId()

    return useAsyncRetry(async () => {
        if (!tokenId) return null
        return fetchToken(chainId, tokenId)
    }, [chainId, tokenId])
}
