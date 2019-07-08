import Gun from 'gun'
import 'gun/lib/then'
import { OnlyRunInContext } from '@holoflows/kit/es'
import { PublishedAESKey } from '../../crypto/crypto-alpha-40'

export interface ApplicationStateInGunVersion1 {
    maskbook: {
        users: {
            // Prove post id
            [user: string]: {
                provePostId: string
            }
        }
        posts: {
            // Post id or salt
            [salt: string]: {
                // NON-TODO: This will leak post targets. (But keys are safe
                // NON-TODO: Consider using hash(id+username) or something
                // ? Resolved in version -40. But not implemented yet.
                [receiversUsername: string]: PublishedAESKey
            }
        }
    }
}
OnlyRunInContext('background', 'Gun')
interface State extends ApplicationStateInGunVersion1 {}
export const gun = new Gun<State>(['http://172.104.123.119:8765/gun']).get('maskbook')
