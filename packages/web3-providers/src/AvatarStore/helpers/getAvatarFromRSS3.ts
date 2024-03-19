import { Web3Storage } from '../../Storage/apis/Storage.js'
import type { RSS3_KEY_SITE, AvatarRSS3 } from '../types.js'

export async function getAvatarFromRSS3(key: RSS3_KEY_SITE, userId: string, address: string) {
    const rss3Storage = Web3Storage.createRSS3Storage(address)
    const result = await rss3Storage.get<Record<string, AvatarRSS3>>(key)
    if (result?.[userId].nft) return result[userId].nft
    return (await rss3Storage.get<AvatarRSS3>('_nft'))?.nft
}
