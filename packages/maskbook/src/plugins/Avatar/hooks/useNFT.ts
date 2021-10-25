import { useAsyncRetry } from 'react-use'
import type { NFT } from '../types'
import { getNFT } from '../utils'

const NFTCache = new Map<string, Promise<NFT | undefined>>()
export function useNFT(address: string, tokenId: string) {
    return useAsyncRetry(async () => {
        let f = NFTCache.get(`{address}-${tokenId}`)
        if (!f) {
            f = getNFT(address, tokenId)
            NFTCache.set(`${address}-${tokenId}`, f)
        }

        const ret = await f
        return ret
    }, [address, tokenId, NFTCache, getNFT])
}
