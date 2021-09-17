import { useAsyncRetry } from 'react-use'
import type { NFT } from '../types'
import { getNFT } from '../utils'

const NFTCache = new Map<string, NFT>()
export function useNFT(userId: string, address: string, tokenId: string) {
    return useAsyncRetry(async () => {
        NFTCache.set(userId, NFTCache.get(userId) ?? (await getNFT(address, tokenId)))
        return NFTCache.get(userId)
    }, [userId, address, tokenId])
}
