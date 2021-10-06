import type { AvatarMetaDB } from '../types'
import { getNFTAvatarFromJSON } from './db'
import { getUserAddress, setUserAddress } from './gun'
import { getNFTAvatarFromRSS, saveNFTAvatarFromRSS } from './rss'

export async function getNFTAvatar(userId: string) {
    const address = await getUserAddress(userId)
    if (!address) return
    let result = await getNFTAvatarFromRSS(address)
    if (!result) {
        result = await getNFTAvatarFromJSON(userId)
    }
    return result
}

export async function saveNFTAvatar(address: string, nft: AvatarMetaDB) {
    await setUserAddress(nft.userId, address)
    const avatar = await saveNFTAvatarFromRSS(address, nft)
    return avatar
}
