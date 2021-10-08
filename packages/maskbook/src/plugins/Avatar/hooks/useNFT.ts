import { useAsyncRetry } from 'react-use'
import type { NFT } from '../types'
import { getNFT } from '../utils'

const NFTCache = new Map<string, Promise<NFT | undefined>>()
export function useNFT(userId: string, address: string, tokenId: string) {
    return useAsyncRetry(async () => {
        let f = NFTCache.get(`${userId}-${address}-${tokenId}`)
        if (!f) {
            f = getNFT(address, tokenId)
            NFTCache.set(`${userId}-${address}-${tokenId}`, f)
        }

        const ret = await f
        return ret
    }, [userId, address, tokenId, NFTCache, getNFT])
}
