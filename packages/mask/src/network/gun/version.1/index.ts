/* eslint import/no-deprecated: 0 */
import Gun from 'gun'
import 'gun/lib/then'
import type { PublishedAESKey } from '../../../crypto/crypto-alpha-40'
import { gun2 } from '../version.2'

/**
 * @deprecated // ! This version will leak post targets ! //
 *
 * This version should be readonly now.
 *
 * Use exchange v2 instead!
 */
interface ApplicationStateInGunVersion1 {
    maskbook: {
        // This section is no longer used but we leave the type here to avoid future collisions
        // users: {
        //     [userID: string]: {
        //         /** @deprecated if you want to read it, cast it to string */
        //         provePostId: never
        //     }
        // }
        posts: {
            // Post salt
            [salt: string]: {
                // ! This will leak post targets. (But keys are safe)
                [receiversUsername: string]: PublishedAESKey
            }
        }
    }
}

function typeHelper() {
    return new Gun<ApplicationStateInGunVersion1>()
}
/** @deprecated */
export const gun1 = (gun2 as any as ReturnType<typeof typeHelper>).get('maskbook')
/**
 * @param salt The salt of this post
 * @param myUsername My username of this post
 * @deprecated Do not use in new code
 */
export async function queryVersion1PostAESKey(salt: string, myUsername: string) {
    const result = await gun1
        .get('posts')
        .get(salt)
        // @ts-expect-error
        .get(myUsername).then!()
    if (result?.encryptedKey && result.salt) return result
    return undefined
}
export async function getVersion1PostByHash(postSalt: string) {
    return (
        gun1
            .get('posts')
            // @ts-expect-error
            .get(postSalt).then!()
    )
}
