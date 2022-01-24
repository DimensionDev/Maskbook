import { fetchToken } from '../apis'
import { useAsync } from 'react-use'
import { useChainId } from '@masknet/web3-shared-evm'

export function useFetchToken(tokenId: number) {
    const chainId = useChainId()

    return useAsync(async () => {
        if (!tokenId) return null

        return fetchToken(chainId, tokenId)
    }, [chainId, tokenId])
}
