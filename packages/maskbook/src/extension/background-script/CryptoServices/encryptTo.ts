import * as Alpha38 from '../../../crypto/crypto-alpha-38'
import { GunAPI as Gun2 } from '../../../network/gun'
import { encodeArrayBuffer } from '@dimensiondev/kit'
import { constructAlpha38, PayloadLatest } from '../../../utils/type-transform/Payload'
import { queryPrivateKey, queryLocalKey, queryProfile } from '../../../database'
import { ProfileIdentifier, PostIVIdentifier } from '../../../database/type'
import { prepareRecipientDetail } from './prepareRecipientDetail'
import { getNetworkWorker } from '../../../social-network/worker'
import { createPostDB, PostRecord } from '../../../database/post'
import { queryPersonaByProfileDB } from '../../../database/Persona/Persona.db'
import { compressSecp256k1Key } from '../../../utils/type-transform/SECP256k1-Compression'
import { i18n } from '../../../utils/i18n-next'
import { isTypedMessageText, TypedMessage, TypedMessageText } from '../../../protocols/typed-message'
import { encodeTextPayloadWorker } from '../../../social-network/utils/text-payload-worker'
import { Flags } from '../../../utils'

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

    const payload: PayloadLatest = {
        AESKeyEncrypted: encodeArrayBuffer(ownersAESKeyEncrypted),
        encryptedText: encodeArrayBuffer(encryptedText),
        iv: encodeArrayBuffer(iv),
        signature: '',
        sharedPublic: publicShared,
        version: -38,
        authorUserID: whoAmI,
    }
    try {
        const publicKey = (await queryPersonaByProfileDB(whoAmI))?.publicKey
        if (publicKey) payload.authorPublicKey = compressSecp256k1Key(publicKey, 'public')
    } catch {
        // ignore
    }

    payload.signature = '_'

    const newPostRecord: PostRecord = {
        identifier: new PostIVIdentifier(whoAmI.network, payload.iv),
        postBy: whoAmI,
        postCryptoKey: postAESKey,
        recipients: publicShared ? 'everyone' : recipients,
        foundAt: new Date(),
        encryptBy: usingPersona.linkedPersona?.identifier,
    }
    if (Flags.v2_enabled) {
        if (isTypedMessageText(content)) {
            newPostRecord.summary = getSummary(content)
            newPostRecord.interestedMeta = content.meta
        }
    }
    await createPostDB(newPostRecord)

    const postAESKeyToken = encodeArrayBuffer(iv)
    const worker = await getNetworkWorker(whoAmI)!
    OthersAESKeyEncryptedMap.set(postAESKeyToken, [worker.gunNetworkHint, othersAESKeyEncrypted])
    return [constructAlpha38(payload, await encodeTextPayloadWorker(whoAmI)), postAESKeyToken]
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
    return Gun2.publishPostAESKeyOnGun2(-38, iv, ...info)
}
function getSummary(content: TypedMessageText) {
    let result = ''
    // UTF-8 aware summary
    if (Intl.Segmenter) {
        // it seems like using "en" can also split the word correctly.
        const seg = new Intl.Segmenter('en')
        for (const word of seg.segment(content.content)) {
            if (result.length >= 30) break
            result += word.segment
        }
    } else {
        result = result.slice(0, 30)
    }
    return result
}
