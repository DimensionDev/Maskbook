import Gun from 'gun'
import 'gun/lib/then'
import { OnlyRunInContext } from '@holoflows/kit/es'

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
                [receiversUsername: string]: {
                    version: -41
                    encryptedText: string
                    salt: string
                }
            }
        }
    }
}
export const gun = new Gun<MaskbookDemoServerState>('https://gungame.herokuapp.com/gun').get('maskbook')
