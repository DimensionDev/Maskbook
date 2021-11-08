import { ProfileIdentifier } from '../type'
import { queryAvatarDB, isAvatarOutdatedDB, storeAvatarDB, IdentityWithAvatar } from '../avatar'
import { memoizePromise } from '../../../utils-pure'
import { MaskMessages } from '../../utils/messages'
import { downloadUrl } from '../../utils/utils'
import { blobToArrayBuffer, blobToDataURL } from '@dimensiondev/kit'

/**
 * Get a (cached) blob url for an identifier.
 * ? Because of cross-origin restrictions, we cannot use blob url here. sad :(
 */
export const queryAvatarDataURL = memoizePromise(
    async function (identifier: IdentityWithAvatar): Promise<string | undefined> {
        const buffer = await queryAvatarDB(identifier)
        if (!buffer) throw new Error('Avatar not found')
        return blobToDataURL(new Blob([buffer], { type: 'image/png' }))
    },
    (id) => id.toText(),
)

/**
 * Store an avatar with a url for an identifier.
 * @param identifier - This avatar belongs to.
 * @param avatar - Avatar to store. If it is a string, will try to fetch it.
 * @param force - Ignore the outdated setting. Force update.
 */

export async function storeAvatar(
    identifier: IdentityWithAvatar,
    avatar: ArrayBuffer | string,
    force?: boolean,
): Promise<void> {
    if (identifier instanceof ProfileIdentifier && identifier.isUnknown) return
    try {
        if (typeof avatar === 'string') {
            if (avatar.startsWith('http') === false) return
            if (force || (await isAvatarOutdatedDB(identifier, 'lastUpdateTime'))) {
                await storeAvatarDB(identifier, await blobToArrayBuffer(await downloadUrl(avatar)))
            }
            // else do nothing
        } else {
            await storeAvatarDB(identifier, avatar)
        }
    } catch (error) {
        console.error('Store avatar failed', error)
    } finally {
        queryAvatarDataURL.cache.delete(identifier.toText())
        if (identifier instanceof ProfileIdentifier) {
            MaskMessages.events.profilesChanged.sendToAll([{ of: identifier, reason: 'update' }])
        }
    }
}
