import {
    queryAvatarDB,
    isAvatarOutdatedDB,
    storeAvatarDB,
    type IdentifierWithAvatar,
    createAvatarDBAccess,
    queryAvatarMetaDataDB,
} from './db.js'
import { blobToDataURL, memoizePromise } from '@masknet/kit'
import { createTransaction } from '../utils/openDB.js'
import { memoize } from 'lodash-es'
import type { PersonaIdentifier } from '@masknet/shared-base'

const impl = memoizePromise(
    memoize,
    async function (identifiers: readonly IdentifierWithAvatar[]): Promise<Map<IdentifierWithAvatar, string>> {
        const promises: Array<Promise<unknown>> = []

        const map = new Map<IdentifierWithAvatar, string>()
        const t = createTransaction(await createAvatarDBAccess(), 'readonly')('avatars')
        for (const id of identifiers) {
            // Must not await here. Because we insert non-idb async operation (blobToDataURL).
            promises.push(
                queryAvatarDB(t, id)
                    .then((avatar) => {
                        if (!avatar) return
                        return typeof avatar === 'string' ? avatar : (
                                blobToDataURL(new Blob([avatar], { type: 'image/png' }))
                            )
                    })
                    .then((url) => url && map.set(id, url)),
            )
        }

        await Promise.allSettled(promises)
        return map
    },
    (id: IdentifierWithAvatar[]) => id.flatMap((x) => x.toText()).join(';'),
)

const queryAvatarLastUpdateTimeImpl = memoizePromise(
    memoize,
    async (identifier: IdentifierWithAvatar) => {
        const t = createTransaction(await createAvatarDBAccess(), 'readonly')('metadata')
        const metadata = await queryAvatarMetaDataDB(t, identifier)
        return metadata?.lastUpdateTime
    },
    (x) => x,
)

export const queryAvatarsDataURL: (
    identifiers: readonly IdentifierWithAvatar[],
) => Promise<Map<IdentifierWithAvatar, string>> = impl

export const queryAvatarLastUpdateTime: (identifier: PersonaIdentifier) => Promise<Date | undefined> =
    queryAvatarLastUpdateTimeImpl

/**
 * Store an avatar with a url for an identifier.
 * @param identifier - This avatar belongs to.
 * @param avatar - Avatar to store. If it is a string, will try to fetch it.
 */

export async function storeAvatar(identifier: IdentifierWithAvatar, avatar: ArrayBuffer | string): Promise<void> {
    try {
        if (typeof avatar === 'string') {
            if (avatar.startsWith('https') === false) return
            const isOutdated = await isAvatarOutdatedDB(
                createTransaction(await createAvatarDBAccess(), 'readonly')('metadata'),
                identifier,
                'lastUpdateTime',
            )
            if (isOutdated) {
                // ! must fetch before create the transaction
                const buffer = await fetch(avatar).then(
                    (r) => r.arrayBuffer(),
                    () => avatar,
                )
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
        queryAvatarLastUpdateTimeImpl.cache.clear()
        impl.cache.clear()
    }
}
