import { first } from 'lodash-es'
import { NFT_AVATAR_JSON_SERVER } from '../constants'
import type { AvatarMetaDB } from '../types'

const EXPIRED_TIME = 5 * 60 * 1000
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

export async function getNFTAvatarFromJSON(userId: string) {
    const db = (await _fetch()).filter((x) => x.userId === userId)
    return first(db)
}
