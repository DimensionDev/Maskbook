/* eslint import/no-deprecated: 0 */
import { OnlyRunInContext } from '@holoflows/kit/es'
import { gun1 } from '.'

OnlyRunInContext('background', 'gun')
/**
 * @param salt The salt of this post
 * @param myUsername My username of this post
 * @deprecated
 */
export async function queryPostAESKey(salt: string, myUsername: string) {
    const result = await gun1
        .get('posts')
        .get(salt)
        .get(myUsername).then!()
    if (result && result.encryptedKey && result.salt) return result
    return undefined
}
