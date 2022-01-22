import { first } from 'lodash-unified'
import { NFT_AVATAR_JSON_SERVER } from '../constants'
import type { AvatarMetaDB } from '../types'

const EXPIRED_TIME = 5 * 60 * 1000
const cache = new Map<'avatar', [number, Promise<AvatarMetaDB[]>]>()

async function fetchData() {
    const response = await fetch(NFT_AVATAR_JSON_SERVER, {
        method: 'GET',
        mode: 'cors',
        credentials: 'omit',
    })
    if (!response.ok) return []

    return response.json() as Promise<AvatarMetaDB[]>
}

async function _fetch() {
    let c = cache.get('avatar')
    if (!c) {
        const f = fetchData()
        cache.set('avatar', [Date.now(), f])
    } else {
        const [t, f] = c
        if (!f || Date.now() - t >= EXPIRED_TIME) {
            const _f = fetchData()
            cache.set('avatar', [Date.now(), _f])
        }
    }

    c = cache.get('avatar')
    if (!c) return []
    const [_, f] = c

    return f
        .then((data) => data)
        .catch((err) => {
            console.log(err)
            cache.delete('avatar')
            return []
        })
}

export async function getNFTAvatarFromJSON(userId: string) {
    const db = (await _fetch()).filter((x) => x.userId === userId)
    return first(db)
}
