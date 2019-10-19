import * as Alpha38 from '../../../crypto/crypto-alpha-38'
import * as Gun2 from '../../../network/gun/version.2'
import { encodeArrayBuffer } from '../../../utils/type-transform/String-ArrayBuffer'
import { constructAlpha38 } from '../../../utils/type-transform/Payload'
import { getMyPrivateKey } from '../../../database'
import { queryLocalKeyDB } from '../../../database/people'
import { PersonIdentifier } from '../../../database/type'
import { prepareOthersKeyForEncryptionV39OrV38 } from '../prepareOthersKeyForEncryption'
import { geti18nString } from '../../../utils/i18n'
import { getNetworkWorker } from '../../../social-network/worker'

type EncryptedText = string
type OthersAESKeyEncryptedToken = string
/**
 * This map stores <iv, othersAESKeyEncrypted>.
 */
const OthersAESKeyEncryptedMap = new Map<OthersAESKeyEncryptedToken, (Alpha38.PublishedAESKeyRecordV39OrV38)[]>()

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
    const toKey = await prepareOthersKeyForEncryptionV39OrV38(to)
    const mine = await getMyPrivateKey(whoAmI)
    if (!mine) throw new TypeError('Not inited yet')
    const {
        encryptedContent: encryptedText,
        version,
        othersAESKeyEncrypted,
        ownersAESKeyEncrypted,
        iv,
    } = await Alpha38.encrypt1ToN({
        version: -38,
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
    const str = `4/4|${ownersAESKeyStr}|${ivStr}|${encryptedTextStr}`
    const signature = encodeArrayBuffer(await Alpha38.sign(str, mine.privateKey))
    // Store AES key to gun
    const key = encodeArrayBuffer(iv)
    OthersAESKeyEncryptedMap.set(key, othersAESKeyEncrypted)
    return [
        `${constructAlpha38(
            {
                encryptedText: encryptedTextStr,
                iv: ivStr,
                AESKeyEncrypted: ownersAESKeyStr,
                signature: signature,
                version: -38,
                sharedPublic: false,
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
export async function publishPostAESKey(iv: string) {
    if (!OthersAESKeyEncryptedMap.has(iv)) throw new Error(geti18nString('service_publish_post_aes_key_failed'))
    // Use the latest payload version here since we do not accept new post for older version.
    return Gun2.publishPostAESKeyOnGun2(-38, iv, OthersAESKeyEncryptedMap.get(iv)!)
}
