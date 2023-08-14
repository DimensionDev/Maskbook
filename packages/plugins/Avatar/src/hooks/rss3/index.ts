import { useCallback } from 'react'
import { Web3Storage } from '@masknet/web3-providers'
import type { RSS3_KEY_SITE } from '../../constants.js'
import type { NFTRSSNode } from '../../types.js'

export function useGetNFTAvatarFromRSS3() {
    return useCallback(async (userId: string, address: string, key: RSS3_KEY_SITE) => {
        const rss3Storage = Web3Storage.createRSS3Storage(address)
        const result = await rss3Storage.get<Record<string, NFTRSSNode>>(key)
        if (result) return result[userId].nft

        return (await rss3Storage.get<NFTRSSNode>('_nft'))?.nft
    }, [])
}
