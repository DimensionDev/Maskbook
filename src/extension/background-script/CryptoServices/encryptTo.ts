import * as Alpha39 from '../../../crypto/crypto-alpha-39'
import * as Gun2 from '../../../network/gun/version.2'
import { encodeArrayBuffer } from '../../../utils/type-transform/String-ArrayBuffer'
import { constructAlpha39 } from '../../../utils/type-transform/Payload'
import { getMyPrivateKey } from '../../../database'
import { queryLocalKeyDB } from '../../../database/people'
import { PersonIdentifier } from '../../../database/type'
import { prepareOthersKeyForEncryptionV39 } from '../prepareOthersKeyForEncryption'
import { geti18nString } from '../../../utils/i18n'
import { getNetworkWorker } from '../../../social-network/worker'

type EncryptedText = string
type OthersAESKeyEncryptedToken = string
/**
 * This map stores <iv, othersAESKeyEncrypted>.
 */
const OthersAESKeyEncryptedMap = new Map<OthersAESKeyEncryptedToken, (Alpha39.PublishedAESKeyRecordV39)[]>()

/**
 * Encrypt to a user
 * @param content       Original text
 * @param to            Encrypt target
 * @param whoAmI        Encrypt source
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
    const toKey = await prepareOthersKeyForEncryptionV39(to)
    const mine = await getMyPrivateKey(whoAmI)
    if (!mine) throw new TypeError('Not inited yet')
    const {
        encryptedContent: encryptedText,
        version,
        othersAESKeyEncrypted,
        ownersAESKeyEncrypted,
        iv,
    } = await Alpha39.encrypt1ToN({
        version: -39,
        content,
        othersPublicKeyECDH: toKey,
        ownersLocalKey: (await queryLocalKeyDB(whoAmI))!,
        privateKeyECDH: mine.privateKey,
        iv: crypto.getRandomValues(new Uint8Array(16)),
    })
    const ownersAESKeyStr = encodeArrayBuffer(ownersAESKeyEncrypted)
    const ivStr = encodeArrayBuffer(iv)
    const encryptedTextStr = encodeArrayBuffer(encryptedText)
    // ! Don't use payload.ts, this is an internal representation used for signature.
    const str = `3/4|${ownersAESKeyStr}|${ivStr}|${encryptedTextStr}`
    const signature = encodeArrayBuffer(await Alpha39.sign(str, mine.privateKey))
    // Store AES key to gun
    const key = encodeArrayBuffer(iv)
    OthersAESKeyEncryptedMap.set(key, othersAESKeyEncrypted)
    return [
        `${constructAlpha39(
            {
                encryptedText: encryptedTextStr,
                iv: ivStr,
                ownersAESKeyEncrypted: ownersAESKeyStr,
                signature: signature,
                version: -39,
            },
            getNetworkWorker(whoAmI.network).payloadEncoder,
        )}`,
        key,
    ]
}

/**
 * MUST call before send post, or othersAESKeyEncrypted will not be published to the internet!
 * TODO: If we can use PostIVIdentifier to avoid this hacking way to publish PostAESKey?
 * @param iv Token that returns in the encryptTo
 */
export async function publishPostAESKey(iv: string, whoAmI: PersonIdentifier) {
    if (!OthersAESKeyEncryptedMap.has(iv)) throw new Error(geti18nString('service_publish_post_aes_key_failed'))
    // Use the latest payload version here since we do not accept new post for older version.
    return Gun2.publishPostAESKeyOnGun2(-39, iv, OthersAESKeyEncryptedMap.get(iv)!)
}
