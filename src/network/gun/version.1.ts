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
            [postIdentifier: string]: {
                // TODO: This will leak post targets. (But keys are safe
                // TODO: Consider using hash(id+username) or something
                [receiversUsername: string]: PublishedAESKey
            }
        }
    }
}
