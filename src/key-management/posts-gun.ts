import { PublishedAESKey } from '../crypto/crypto-alpha-40'
import { OnlyRunInContext } from '@holoflows/kit/es'
import { gun } from '../network/gun/version.1'
import { updatePostDB } from '../database/post'
import { PostIdentifier, PersonIdentifier } from '../database/type'

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
    if (result && result.encryptedKey && result.salt) return result
    return undefined
}

export async function publishPostAESKey(
    postIdentifier: string,
    whoAmI: PersonIdentifier,
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
    updatePostDB(
        {
            identifier: new PostIdentifier(whoAmI, postIdentifier.replace(/\//g, '|')),
            recipients: receiversKeys.map(x => new PersonIdentifier(whoAmI.network, x.name)),
        },
        'append',
    )
    await gun
        .get('posts')
        .get(postIdentifier)
        .put(stored).then!()
}

Object.assign(window, { queryPostAESKey, publishPostAESKey })
