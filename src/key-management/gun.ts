import Gun from 'gun'
import 'gun/lib/then'
import { OnlyRunInContext } from '@holoflows/kit/es'
import { PublishedAESKey } from '../crypto/crypto-alpha-41'

OnlyRunInContext('background', 'Gun')
interface Person {
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
            [user: string]: Person
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
export const gun = new Gun<MaskbookDemoServerState>('https://gungame.herokuapp.com/gun').get('maskbook')
