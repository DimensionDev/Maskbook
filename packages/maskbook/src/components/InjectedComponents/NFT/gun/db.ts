import { delay } from '@masknet/shared-base'
import { AvatarMetaDB, NFT_AVATAR_JSON_SERVER } from '../types'

const EXPIRED_TIME = 5 * 60
const cache = new Map<'avatar', [number, Promise<AvatarMetaDB[]>]>()

async function fetchData() {
    const response = await fetch(NFT_AVATAR_JSON_SERVER)
    if (!response.ok) return []
    const json = (await response.json()) as AvatarMetaDB[]
    return json
}

async function _fetch() {
    const c = cache.get('avatar')
    let f, json
    if (c) {
        f = c[1]
        if (!f) {
            f = fetchData()
            cache.set('avatar', [Date.now(), f])
        }
        if (Date.now() - c[0] >= EXPIRED_TIME) {
            json = await f
            f = fetchData()
            cache.set('avatar', [Date.now(), f])
            return json
        }
    } else {
        f = fetchData()
        cache.set('avatar', [Date.now(), f])
    }

    json = await f
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
