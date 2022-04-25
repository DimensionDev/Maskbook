import { queryAvatarDB, isAvatarOutdatedDB, storeAvatarDB, IdentifierWithAvatar, createAvatarDBAccess } from './db'
import { hasNativeAPI, nativeAPI } from '../../../shared/native-rpc'
import { blobToDataURL, memoizePromise } from '@dimensiondev/kit'
import { createTransaction } from '../utils/openDB'

/**
 * Get a (cached) blob url for an identifier. No cache for native api.
 * ? Because of cross-origin restrictions, we cannot use blob url here. sad :(
 */
async function nativeImpl(identifiers: IdentifierWithAvatar[]): Promise<Map<IdentifierWithAvatar, string>> {
    const map = new Map<IdentifierWithAvatar, string>(new Map())
    await Promise.allSettled(
        identifiers.map(async (id) => {
            const result = await nativeAPI!.api.query_avatar({ identifier: id.toText() })
            result && map.set(id, result)
        }),
    )
    return map
}
const indexedDBImpl = memoizePromise(
    async function (identifiers: IdentifierWithAvatar[]): Promise<Map<IdentifierWithAvatar, string>> {
        const promises: Promise<unknown>[] = []

        const map = new Map<IdentifierWithAvatar, string>()
        const t = createTransaction(await createAvatarDBAccess(), 'readonly')('avatars')
        for (const id of identifiers) {
            // Must not await here. Because we insert non-idb async operation (blobToDataURL).
            promises.push(
                queryAvatarDB(t, id)
                    .then((buffer) => buffer && blobToDataURL(new Blob([buffer], { type: 'image/png' })))
                    .then((url) => url && map.set(id, url)),
            )
        }

        await Promise.allSettled(promises)
        return map
    },
    (id) => id.flatMap((x) => x.toText()).join(';'),
)
export const queryAvatarsDataURL: (identifiers: IdentifierWithAvatar[]) => Promise<Map<IdentifierWithAvatar, string>> =
    hasNativeAPI ? nativeImpl : indexedDBImpl

/**
 * Store an avatar with a url for an identifier.
 * @param identifier - This avatar belongs to.
 * @param avatar - Avatar to store. If it is a string, will try to fetch it.
 */

export async function storeAvatar(identifier: IdentifierWithAvatar, avatar: ArrayBuffer | string): Promise<void> {
    try {
        if (hasNativeAPI) {
            // ArrayBuffer is unreachable on Native side.
            if (typeof avatar !== 'string') return
            await nativeAPI?.api.store_avatar({ identifier: identifier.toText(), avatar: avatar as string })
            return
        }
        if (typeof avatar === 'string') {
            if (avatar.startsWith('https') === false) return
            const isOutdated = await isAvatarOutdatedDB(
                createTransaction(await createAvatarDBAccess(), 'readonly')('metadata'),
                identifier,
                'lastUpdateTime',
            )
            if (isOutdated) {
                // ! must fetch before create the transaction
                const buffer = await (await fetch(avatar)).arrayBuffer()
                {
                    const t = createTransaction(await createAvatarDBAccess(), 'readwrite')('avatars', 'metadata')
                    await storeAvatarDB(t, identifier, buffer)
                }
            }
            // else do nothing
        } else {
            const t = createTransaction(await createAvatarDBAccess(), 'readwrite')('avatars', 'metadata')
            await storeAvatarDB(t, identifier, avatar)
        }
    } catch (error) {
        console.error('[AvatarDB] Store avatar failed', error)
    } finally {
        indexedDBImpl.cache?.delete(identifier.toText())
    }
}
