import * as Alpha38 from '../../../crypto/crypto-alpha-38'
import { decodeArrayBuffer, encodeArrayBuffer } from '@dimensiondev/kit'
import { queryPrivateKey, queryLocalKey, queryProfile } from '../../../database'
import { ProfileIdentifier, PostIVIdentifier } from '@masknet/shared-base'
import { prepareRecipientDetail } from './prepareRecipientDetail'
import { getNetworkWorker } from '../../../social-network/worker'
import { createPostDB, PostRecord } from '../../../../background/database/post'
import { queryPersonaByProfileDB } from '../../../../background/database/persona/db'
import { i18n } from '../../../../shared-ui/locales_legacy'
import { isTypedMessageText, TypedMessage, TypedMessageText } from '@masknet/shared-base'
import { publishPostAESKey_version39Or38 } from '../../../../background/network/gun/encryption/queryPostKey'
import { getGunInstance } from '../../../../background/network/gun/instance'
import {
    PayloadWellFormed,
    PublicKeyAlgorithmEnum,
    importAsymmetryKeyFromJsonWebKeyOrSPKI,
    AESAlgorithmEnum,
    importAESFromJWK,
    encodePayload,
} from '@masknet/encryption'
import { None, Some } from 'ts-results'

type EncryptedText = string
type OthersAESKeyEncryptedToken = string
/**
 * This map stores <iv, [networkHint, othersAESKeyEncrypted]>.
 */
const OthersAESKeyEncryptedMap = new Map<
    OthersAESKeyEncryptedToken,
    [string, Alpha38.PublishedAESKeyRecordV39OrV38[]]
>()

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
    content: TypedMessage,
    to: ProfileIdentifier[],
    whoAmI: ProfileIdentifier,
    publicShared: boolean,
): Promise<[EncryptedText, OthersAESKeyEncryptedToken]> {
    if (publicShared) to = []
    const [recipients, toKey] = await prepareRecipientDetail(to)

    const usingPersona = await queryProfile(whoAmI)
    const minePrivateKey = await queryPrivateKey(whoAmI)
    if (!minePrivateKey) throw new TypeError('Not initialized yet')
    const stringifiedContent = Alpha38.typedMessageStringify(content)
    const localKey = publicShared ? Alpha38.publicSharedAESKey : (await queryLocalKey(whoAmI))!
    const {
        encryptedContent: encryptedText,
        othersAESKeyEncrypted,
        ownersAESKeyEncrypted,
        iv,
        postAESKey,
    } = await Alpha38.encrypt1ToN({
        version: -38,
        content: stringifiedContent,
        othersPublicKeyECDH: Array.from(toKey.values()),
        ownersLocalKey: localKey,
        privateKeyECDH: minePrivateKey,
        iv: crypto.getRandomValues(new Uint8Array(16)),
    })

    let authorPublicKey: PayloadWellFormed.Payload['authorPublicKey'] = None
    try {
        const publicKey = (await queryPersonaByProfileDB(whoAmI))?.publicKey
        if (publicKey) {
            authorPublicKey = Some({
                algr: PublicKeyAlgorithmEnum.secp256k1,
                key: (
                    await importAsymmetryKeyFromJsonWebKeyOrSPKI(publicKey, PublicKeyAlgorithmEnum.secp256k1)
                ).unwrap(),
            })
        }
    } catch {
        // ignore
    }

    const postCryptoKey = (await importAESFromJWK(postAESKey, AESAlgorithmEnum.A256GCM)).unwrap()
    let encryption: PayloadWellFormed.EndToEndEncryption | PayloadWellFormed.PublicEncryption
    if (publicShared) {
        encryption = {
            type: 'public',
            iv: new Uint8Array(iv),
            AESKey: {
                algr: AESAlgorithmEnum.A256GCM,
                key: postCryptoKey,
            },
        }
    } else {
        encryption = {
            type: 'E2E',
            iv: new Uint8Array(iv),
            ephemeralPublicKey: new Map(),
            ownersAESKeyEncrypted: new Uint8Array(ownersAESKeyEncrypted),
        }
    }

    const payload: PayloadWellFormed.Payload = {
        version: -38,
        author: Some(whoAmI),
        encryption,
        encrypted: new Uint8Array(encryptedText),
        authorPublicKey,
        // not supported
        signature: None,
    }

    const newPostRecord: PostRecord = {
        identifier: new PostIVIdentifier(whoAmI.network, encodeArrayBuffer(iv)),
        postBy: whoAmI,
        postCryptoKey: postAESKey,
        recipients: publicShared ? 'everyone' : recipients,
        foundAt: new Date(),
        encryptBy: usingPersona.linkedPersona?.identifier,
    }
    if (isTypedMessageText(content)) {
        newPostRecord.summary = getSummary(content)
        newPostRecord.interestedMeta = content.meta
    }
    await createPostDB(newPostRecord)

    const postAESKeyToken = encodeArrayBuffer(iv)
    const worker = await getNetworkWorker(whoAmI)!
    OthersAESKeyEncryptedMap.set(postAESKeyToken, [worker.gunNetworkHint, othersAESKeyEncrypted])
    const payloadEncoded = (await encodePayload.NoSign(payload)).unwrap()
    if (typeof payloadEncoded !== 'string') throw new TypeError('')
    return [payloadEncoded, postAESKeyToken]
}

/**
 * MUST call before send post, or othersAESKeyEncrypted will not be published to the internet!
 * TODO: If we can use PostIVIdentifier to avoid this hacking way to publish PostAESKey?
 * @param iv Token that returns in the encryptTo
 */
export async function publishPostAESKey(iv: string) {
    const info = OthersAESKeyEncryptedMap.get(iv)
    if (!info) throw new Error(i18n.t('service_publish_post_aes_key_failed'))
    if (!info[1].length) return
    // Use the latest payload version here since we do not accept new post for older version.
    return publishPostAESKey_version39Or38(getGunInstance(), -38, new Uint8Array(decodeArrayBuffer(iv)), ...info)
}

const SUMMARY_MAX_LENGTH = 40
function getSummary(content: TypedMessageText) {
    let result = ''
    const sliceLength = content.content.length > SUMMARY_MAX_LENGTH ? SUMMARY_MAX_LENGTH + 1 : SUMMARY_MAX_LENGTH

    // UTF-8 aware summary
    if (Intl.Segmenter) {
        // it seems like using "en" can also split the word correctly.
        const seg = new Intl.Segmenter('en')
        for (const word of seg.segment(content.content)) {
            if (result.length >= sliceLength) break
            result += word.segment
        }
    } else {
        result = content.content.slice(0, sliceLength)
    }
    return result
}
