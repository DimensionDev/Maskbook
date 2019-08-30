/* eslint import/no-deprecated: 0 */
import Gun from 'gun'
import 'gun/lib/then'
import { OnlyRunInContext } from '@holoflows/kit/es'
import { PublishedAESKey } from '../../../crypto/crypto-alpha-40'
import { gun1Servers } from '../../gun-servers'

export * from './people'
export * from './posts'
OnlyRunInContext('background', 'Gun')

/**
 * @deprecated // ! This version will leak post targets ! //
 *
 * Use exchange v2 instead!
 */
export interface ApplicationStateInGunVersion1 {
    maskbook: {
        users: {
            // User ID
            [userID: string]: {
                provePostId: string
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
/** @deprecated */
export const gun1 = new Gun<ApplicationStateInGunVersion1>(gun1Servers).get('maskbook')
