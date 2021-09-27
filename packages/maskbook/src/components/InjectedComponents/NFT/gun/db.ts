import { delay } from '@masknet/shared-base'
import { AvatarMetaDB, NFT_AVATAR_JSON_SERVER } from '../types'

const cache = new Map<'avatardb', Promise<AvatarMetaDB[]>>()

async function fetchData() {
    const response = await fetch(NFT_AVATAR_JSON_SERVER)
    const json = await response.json()
    return json
}

async function _fetch() {
    let f = cache.get('avatardb')
    if (!f) {
        f = fetchData()
        cache.set('avatardb', f)
    }

    const json = await f

    return json
}

export async function getNFTAvatar(userId: string) {
    const db = (await _fetch()).filter((x) => x.userId === userId)
    if (db?.length === 0) return

    return db[0]
}

export async function setOrClearAvatar(userId: string, avatar?: AvatarMetaDB) {
    await delay(500)
}

export async function getNFTAvatars() {
    const AvatarDB = await _fetch()
    return AvatarDB
}

export async function saveNFTAvatar(userId: string, avatarId: string, address: string, tokenId: string) {
    await delay(500)
    return {
        userId,
        avatarId,
        address,
        tokenId,
    }
}
