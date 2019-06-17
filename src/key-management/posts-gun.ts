import { gun } from './gun'
import { PublishedAESKey } from '../crypto/crypto-alpha-40'
import { OnlyRunInContext } from '@holoflows/kit/es'

OnlyRunInContext('background', 'gun')
/**
 * @param salt The salt of this post
 * @param myUsername My username of this post
 */
export async function queryPostAESKey(salt: string, myUsername: string) {
    const result = await gun
        .get('posts')
        .get(salt)
        .get(myUsername)
        .once().then!()
    if (result.encryptedKey && result.salt) return result
    return undefined
}

export async function publishPostAESKey(
    postIdentifier: string,
    receiversKeys: {
        key: PublishedAESKey
        name: string
    }[],
) {
    // Store AES key to gun
    const stored: {
        [postIdentifier: string]: PublishedAESKey
    } = {}
    for (const k of receiversKeys) {
        stored[k.name] = k.key
    }
    console.log('Save to gun', postIdentifier, receiversKeys)
    await gun
        .get('posts')
        .get(postIdentifier)
        .put(stored).then!()
}

Object.assign(window, { queryPostAESKey, publishPostAESKey })
