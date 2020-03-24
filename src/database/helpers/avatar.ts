import { ProfileIdentifier, GroupIdentifier } from '../type'
import { queryAvatarDB, isAvatarOutdatedDB, storeAvatarDB } from '../avatar'
import { memoizePromise } from '../../utils/memoize'
import { MessageCenter } from '../../utils/messages'
import { downloadUrl } from '../../utils/utils'
import { queryProfile } from '..'

/**
 * Get a (cached) blob url for an identifier.
 * ? Because of cross-origin restrictions, we cannot use blob url here. sad :(
 */
export const getAvatarDataURL = memoizePromise(
    async function (identifier: ProfileIdentifier | GroupIdentifier): Promise<string | undefined> {
        const buffer = await queryAvatarDB(identifier)
        if (!buffer) throw new Error('Avatar not found')
        return ArrayBufferToBase64(buffer)
    },
    (id) => id.toText(),
)

function ArrayBufferToBase64(buffer: ArrayBuffer) {
    const f = new Blob([buffer], { type: 'image/png' })
    const fr = new FileReader()
    return new Promise<string>((resolve) => {
        fr.onload = () => resolve(fr.result as string)
        fr.readAsDataURL(f)
    })
}

/**
 * Store an avatar with a url for an identifier.
 * @param identifier - This avatar belongs to.
 * @param avatar - Avatar to store. If it is a string, will try to fetch it.
 * @param force - Ignore the outdated setting. Force update.
 */

export async function storeAvatar(
    identifier: ProfileIdentifier | GroupIdentifier,
    avatar: ArrayBuffer | string,
    force?: boolean,
) {
    if (identifier instanceof ProfileIdentifier && identifier.isUnknown) return
    try {
        if (typeof avatar === 'string') {
            if (avatar.startsWith('http') === false) return
            if (force || (await isAvatarOutdatedDB(identifier, 'lastUpdateTime'))) {
                await storeAvatarDB(identifier, await downloadUrl(avatar))
            }
            // else do nothing
        } else {
            await storeAvatarDB(identifier, avatar)
        }
    } catch (e) {
        console.error('Store avatar failed', e)
    } finally {
        getAvatarDataURL.cache.delete(identifier.toText())
        if (identifier instanceof ProfileIdentifier) {
            MessageCenter.emit('profilesChanged', [{ of: await queryProfile(identifier), reason: 'update' }])
        }
    }
}
