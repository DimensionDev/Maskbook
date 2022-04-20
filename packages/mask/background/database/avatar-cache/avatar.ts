import { ProfileIdentifier } from '@masknet/shared-base'
import { queryAvatarDB, isAvatarOutdatedDB, storeAvatarDB, IdentifierWithAvatar, createAvatarDBAccess } from './db'
import { hasNativeAPI, nativeAPI } from '../../../shared/native-rpc'
import { blobToDataURL, memoizePromise } from '@dimensiondev/kit'
import { createTransaction } from '../utils/openDB'

/**
 * Get a (cached) blob url for an identifier. No cache for native api.
 * ? Because of cross-origin restrictions, we cannot use blob url here. sad :(
 */
async function nativeImpl(identifier: IdentifierWithAvatar): Promise<string | undefined> {
    return nativeAPI?.api.query_avatar({ identifier: identifier.toText() })
}
const indexedDBImpl = memoizePromise(
    async function (identifier: IdentifierWithAvatar): Promise<string | undefined> {
        const t = createTransaction(await createAvatarDBAccess(), 'readonly')('avatars')
        const buffer = await queryAvatarDB(t, identifier)
        if (!buffer) throw new Error('Avatar not found')
        return blobToDataURL(new Blob([buffer], { type: 'image/png' }))
    },
    (id) => id.toText(),
)
export const queryAvatarDataURL: (identifier: IdentifierWithAvatar) => Promise<string | undefined> = hasNativeAPI
    ? nativeImpl
    : indexedDBImpl

/**
 * Store an avatar with a url for an identifier.
 * @param identifier - This avatar belongs to.
 * @param avatar - Avatar to store. If it is a string, will try to fetch it.
 * @param force - Ignore the outdated setting. Force update.
 */

export async function storeAvatar(identifier: IdentifierWithAvatar, avatar: ArrayBuffer | string): Promise<void> {
    if (identifier instanceof ProfileIdentifier && identifier.isUnknown) return
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
