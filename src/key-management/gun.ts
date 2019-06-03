import Gun from 'gun'
import 'gun/lib/then'
import { OnlyRunInContext } from '@holoflows/kit/es'
import { PublishedAESKey } from '../crypto/crypto-alpha-40'

OnlyRunInContext('background', 'Gun')
interface PersonInGun {
    provePostId: string
}
interface Post {
    [username: string]: {
        key: string
    }
}
interface MaskbookDemoServerState {
    maskbook: {
        users: {
            // Prove post id
            [user: string]: PersonInGun
        }
        posts: {
            // Post id or salt
            [postIdentifier: string]: {
                // TODO: This will leak post targets. (But keys are safe
                // TODO: Consider using hash(id+username) or something
                [receiversUsername: string]: PublishedAESKey
            }
        }
    }
}
export const gun = new Gun<MaskbookDemoServerState>([
    'http://172.104.123.119:8765/gun',
]).get('maskbook')
