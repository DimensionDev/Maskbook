import { gun } from './gun'

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
        [username: string]: {
            version: -41
            encryptedText: string
            salt: string
        }
    },
) {
    await gun.get('posts').put({
        [postIdentifier]: receiversKeys,
    }).then!()
}

Object.assign(window, { queryPostAESKey, publishPostAESKey })
