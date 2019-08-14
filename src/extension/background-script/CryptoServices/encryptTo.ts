import * as Alpha40 from '../../../crypto/crypto-alpha-40'
import * as Alpha39 from '../../../crypto/crypto-alpha-39'
import * as Gun1 from '../../../network/gun/version.1'
import * as Gun2 from '../../../network/gun/version.2'
import { encodeArrayBuffer } from '../../../utils/type-transform/String-ArrayBuffer'
import { constructAlpha40 } from '../../../utils/type-transform/Payload'
import { getMyPrivateKey } from '../../../database'
import { queryLocalKeyDB } from '../../../database/people'
import { PersonIdentifier } from '../../../database/type'
import { prepareOthersKeyForEncryption } from '../prepareOthersKeyForEncryption'
import { geti18nString } from '../../../utils/i18n'

type EncryptedText = string
type OthersAESKeyEncryptedToken = string
/**
 * This map stores <token, othersAESKeyEncrypted>.
 */
const OthersAESKeyEncryptedMap = new Map<
    OthersAESKeyEncryptedToken,
    {
        key: Alpha40.PublishedAESKey
        name: string
    }[]
>()
/**
 * Encrypt to a user
 * @param content Original text
 * @param to Encrypt target
 * @returns Will return a tuple of [encrypted: string, token: string] where
 * - `encrypted` is the encrypted string
 * - `token` is used to call `publishPostAESKey` before post the content
 */
export async function encryptTo(
    content: string,
    to: PersonIdentifier[],
    whoAmI: PersonIdentifier,
): Promise<[EncryptedText, OthersAESKeyEncryptedToken]> {
    if (to.length === 0) return ['', '']
    const toKey = await prepareOthersKeyForEncryption(to)
    const mine = await getMyPrivateKey(whoAmI)
    if (!mine) throw new TypeError('Not inited yet')
    const {
        encryptedContent: encryptedText,
        version,
        othersAESKeyEncrypted,
        ownersAESKeyEncrypted,
        iv,
    } = await Alpha40.encrypt1ToN({
        version: -40,
        content: content,
        othersPublicKeyECDH: toKey,
        ownersLocalKey: (await queryLocalKeyDB(whoAmI))!,
        privateKeyECDH: mine.privateKey,
        iv: crypto.getRandomValues(new Uint8Array(16)),
    })
    const ownersAESKeyStr = encodeArrayBuffer(ownersAESKeyEncrypted)
    const ivStr = encodeArrayBuffer(iv)
    const encryptedTextStr = encodeArrayBuffer(encryptedText)
    // ! Don't use payload.ts, this is an internal representation used for signature.
    const str = `2/4|${ownersAESKeyStr}|${ivStr}|${encryptedTextStr}`
    const signature = encodeArrayBuffer(await Alpha40.sign(str, mine.privateKey))
    // Store AES key to gun
    const key = encodeArrayBuffer(iv)
    OthersAESKeyEncryptedMap.set(key, othersAESKeyEncrypted)
    return [
        `${constructAlpha40({
            encryptedText: encryptedTextStr,
            iv: ivStr,
            ownersAESKeyEncrypted: ownersAESKeyStr,
            signature: signature,
            version: -40,
        })}`,
        key,
    ]
}

/**
 * MUST call before send post, or othersAESKeyEncrypted will not be published to the internet!
 * @param token Token that returns in the encryptTo
 */
export async function publishPostAESKey(token: string, whoAmI: PersonIdentifier) {
    if (!OthersAESKeyEncryptedMap.has(token)) throw new Error(geti18nString('service_publish_post_aes_key_failed'))
    return Gun1.publishPostAESKey(token, whoAmI, OthersAESKeyEncryptedMap.get(token)!)
}
