import { gun } from './gun'
import { PublishedAESKey } from '../crypto/crypto-alpha-41'

export async function queryPostAESKey(postIdentifier: string, myUsername: string) {
    return gun
        .get('posts')
        .get(postIdentifier)
        .get(myUsername)
        .once().then!()
}

export async function publishPostAESKey(
    postIdentifier: string,
    receiversKeys: {
        [username: string]: PublishedAESKey
    },
) {
    console.log('Save to gun', postIdentifier, receiversKeys)
    await gun.get('posts').put({
        [postIdentifier]: receiversKeys,
    }).then!()
}

Object.assign(window, { queryPostAESKey, publishPostAESKey })
