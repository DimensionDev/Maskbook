import { PersonIdentifier, GroupIdentifier } from '../type'
import { queryAvatarDB, isAvatarOutdatedDB, storeAvatarDB } from '../avatar'

const avatarCache = new Map<string, string>()

/**
 * Get a (cached) blob url for an identifier.
 */
export async function getAvatarBlobURL(identifier: PersonIdentifier | GroupIdentifier): Promise<string | undefined> {
    const id = identifier.toString()
    if (avatarCache.has(id)) return avatarCache.get(id)!
    const buffer = await queryAvatarDB(identifier)
    if (!buffer) return undefined
    const blob = new Blob([buffer], { type: 'image/png' })
    const url = URL.createObjectURL(blob)
    avatarCache.set(id, url)
    return url
}

/**
 * Store an avatar with a url for an identifier.
 * @param avatar - Avatar to store. If it is a string, will try to fetch it.
 * @param identifier - This avatar belongs to.
 */

export async function storeAvatar(identifier: PersonIdentifier | GroupIdentifier, avatar: ArrayBuffer | string) {
    try {
        if (typeof avatar === 'string') {
            if (await isAvatarOutdatedDB(identifier, 'lastUpdateTime')) {
                await storeAvatarDB(identifier, await downloadAvatar(avatar))
            }
            // else do nothing
        } else {
            await storeAvatarDB(identifier, avatar)
        }
    } catch (e) {
        console.error('Store avatar failed', e)
    }
}
/**
 * Download avatar from url
 */
async function downloadAvatar(url: string): Promise<ArrayBuffer> {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Fetch avatar failed.')
    return res.arrayBuffer()
}
