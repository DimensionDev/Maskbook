/* eslint import/no-deprecated: 0 */
import Gun from 'gun'
import 'gun/lib/then'
import { OnlyRunInContext } from '@holoflows/kit/es'
import type { PublishedAESKey } from '../../../crypto/crypto-alpha-40'
import { gun2 } from '../version.2'

export * from './posts'
OnlyRunInContext('background', 'Gun')

/**
 * @deprecated // ! This version will leak post targets ! //
 *
 * This version should be readonly now.
 *
 * Use exchange v2 instead!
 */
export interface ApplicationStateInGunVersion1 {
    maskbook: {
        users: {
            // User ID
            [userID: string]: {
                /** @deprecated if you want to read it, cast it to string */
                provePostId: never
            }
        }
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
export const gun1 = ((gun2 as any) as ReturnType<typeof typeHelper>).get('maskbook')
