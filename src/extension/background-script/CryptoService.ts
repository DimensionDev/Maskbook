import * as Alpha40 from '../../crypto/crypto-alpha-40'
import { OnlyRunInContext } from '@holoflows/kit/es'
import { addPersonPublicKey } from '../../key-management/people-gun'
import { publishPostAESKey as publishPostAESKey_Service, queryPostAESKey } from '../../key-management/posts-gun'

import { decodeText, encodeArrayBuffer, decodeArrayBuffer } from '../../utils/type-transform/String-ArrayBuffer'
import { constructAlpha40, deconstructPayload } from '../../utils/type-transform/Payload'
import { geti18nString } from '../../utils/i18n'
import { toCompressSecp256k1Point, unCompressSecp256k1Point } from '../../utils/type-transform/SECP256k1-Compression'
import { Person, getMyPrivateKeyAtFacebook, queryPerson } from '../../database'
import {
    getDefaultLocalKeyOrGenerateOneDB,
    queryMyIdentityAtDB,
    storeNewPersonDB,
    queryPersonDB,
    PersonRecord,
} from '../../database/people'
import { PersonIdentifier } from '../../database/type'
import { gun } from '../../key-management/gun'

OnlyRunInContext('background', 'EncryptService')
//#region Encrypt & Decrypt
type EncryptedText = string
type OthersAESKeyEncryptedToken = string
/**
 * @internal
 */
async function prepareOthersKeyForEncryption(to: PersonIdentifier[]): Promise<{ name: string; key: CryptoKey }[]> {
    const data = await Promise.all(to.map(x => x).map(queryPersonDB))
    return data
        .filter((x): x is NonNullable<typeof x> => !!x)
        .map(x => ({ name: x.identifier.userId, key: x.publicKey! }))
}
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
): Promise<[EncryptedText, OthersAESKeyEncryptedToken]> {
    if (to.length === 0) return ['', '']
    const toKey = await prepareOthersKeyForEncryption(to)

    // tslint:disable-next-line: deprecation
    const mine = await getMyPrivateKeyAtFacebook()
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
        ownersLocalKey: await getDefaultLocalKeyOrGenerateOneDB(),
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
        `https://Maskbook.io : ${constructAlpha40({
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
export async function publishPostAESKey(token: string) {
    if (!OthersAESKeyEncryptedMap.has(token)) throw new Error(geti18nString('service_publish_post_aes_key_failed'))
    return publishPostAESKey_Service(token, OthersAESKeyEncryptedMap.get(token)!)
}

/**
 * Decrypt message from a user
 * @param encrypted post
 * @param by Post by
 * @param whoAmI My username
 */
export async function decryptFrom(
    encrypted: string,
    by: PersonIdentifier,
    whoAmI: PersonIdentifier,
): Promise<{ signatureVerifyResult: boolean; content: string } | { error: string }> {
    const data = deconstructPayload(encrypted)!
    if (!data) {
        try {
            deconstructPayload(encrypted, true)
        } catch (e) {
            return { error: e.message }
        }
    }
    if (data.version === -40) {
        const { encryptedText, iv: salt, ownersAESKeyEncrypted, signature, version } = data
        async function getKey(user: PersonIdentifier) {
            let person = await queryPersonDB(by)
            try {
                if (!person || !person.publicKey) await addPersonPublicKey(user)
                person = (await queryPersonDB(by))!
            } catch {
                return null
            }
            return person.publicKey
        }
        const byKey = await getKey(by)
        if (!byKey) return { error: geti18nString('service_others_key_not_found', by.userId) }
        // tslint:disable-next-line: deprecation
        const mine = await getMyPrivateKeyAtFacebook(whoAmI)
        if (!mine) return { error: geti18nString('service_not_setup_yet') }
        try {
            const unverified = ['2/4', ownersAESKeyEncrypted, salt, encryptedText].join('|')
            if (by.equals(whoAmI)) {
                const content = decodeText(
                    await Alpha40.decryptMessage1ToNByMyself({
                        version: -40,
                        encryptedAESKey: ownersAESKeyEncrypted,
                        encryptedContent: encryptedText,
                        myLocalKey: await getDefaultLocalKeyOrGenerateOneDB(),
                        iv: salt,
                    }),
                )
                try {
                    if (!signature) throw new TypeError('No signature')
                    const signatureVerifyResult = await Alpha40.verify(unverified, signature, mine.publicKey)
                    return { signatureVerifyResult, content }
                } catch {
                    return { signatureVerifyResult: false, content }
                }
            } else {
                const aesKeyEncrypted = await queryPostAESKey(salt, whoAmI.userId)
                // TODO: Replace this error with:
                // You do not have the necessary private key to decrypt this message.
                // What to do next: You can ask your friend to visit your profile page, so that their Maskbook extension will detect and add you to recipients.
                // ? after the auto-share with friends is done.
                if (aesKeyEncrypted === undefined) {
                    return {
                        error: geti18nString('service_not_share_target'),
                    }
                }
                const content = decodeText(
                    await Alpha40.decryptMessage1ToNByOther({
                        version: -40,
                        AESKeyEncrypted: aesKeyEncrypted,
                        authorsPublicKeyECDH: byKey,
                        encryptedContent: encryptedText,
                        privateKeyECDH: mine.privateKey,
                        iv: salt,
                    }),
                )
                try {
                    if (!signature) throw new TypeError('No signature')
                    const signatureVerifyResult = await Alpha40.verify(unverified, signature, byKey)
                    return { signatureVerifyResult, content }
                } catch {
                    return { signatureVerifyResult: false, content }
                }
            }
        } catch (e) {
            if (e instanceof DOMException) {
                console.error(e)
                return { error: geti18nString('service_decryption_failed') }
            } else throw e
        }
    }
    return { error: geti18nString('service_unknown_payload') }
}
//#endregion

//#region ProvePost, create & verify
export async function getMyProveBio(whoami: PersonIdentifier): Promise<string | null> {
    const myIdentity = await queryMyIdentityAtDB(whoami)
    if (!myIdentity) return null
    const pub = await crypto.subtle.exportKey('jwk', myIdentity.publicKey)
    const compressed = toCompressSecp256k1Point(pub.x!, pub.y!)
    return `🔒${encodeArrayBuffer(compressed)}🔒`
}
export async function verifyOthersProve(bio: string, others: PersonIdentifier) {
    const [_, compressedX, _2] = bio.split('🔒')
    if (!compressedX) return null
    const { x, y } = unCompressSecp256k1Point(decodeArrayBuffer(compressedX))
    const key: JsonWebKey = {
        crv: 'K-256',
        ext: true,
        x: x,
        y: y,
        key_ops: ['deriveKey'],
        kty: 'EC',
    }
    let publicKey: CryptoKey
    try {
        publicKey = await crypto.subtle.importKey('jwk', key, { name: 'ECDH', namedCurve: 'K-256' }, true, [
            'deriveKey',
        ])
    } catch {
        throw new Error(geti18nString('service_key_parse_failed'))
    }
    storeNewPersonDB({
        identifier: others,
        groups: [],
        publicKey: publicKey,
        relation: [],
        // TODO: Add relation verify at caller, then change to new Date()
        relationLastCheckTime: new Date('Jan 1 2019'),
    })
    return publicKey
}
//#endregion

//#region Append decryptor in future
/**
 * Get already shared target of the post
 * @param postIdentifier Post identifier
 */
export async function getSharedListOfPost(postIdentifier: string): Promise<Person[]> {
    const post = await gun
        .get('posts')
        .get(postIdentifier)
        .once().then!()
    if (!post) return []
    delete post._
    return Promise.all(Object.keys(post).map(id => queryPerson(new PersonIdentifier('facebook.com', id))))
}
export async function appendShareTarget(
    postIdentifier: string,
    ownersAESKeyEncrypted: string,
    iv: string,
    people: PersonIdentifier[],
): Promise<void> {
    const toKey = await prepareOthersKeyForEncryption(people)
    const AESKey = await Alpha40.extractAESKeyInMessage(
        -40,
        ownersAESKeyEncrypted,
        iv,
        await getDefaultLocalKeyOrGenerateOneDB(),
    )
    const othersAESKeyEncrypted = await Alpha40.generateOthersAESKeyEncrypted(
        -40,
        AESKey,
        // tslint:disable-next-line: deprecation
        (await getMyPrivateKeyAtFacebook())!.privateKey,
        toKey,
    )
    publishPostAESKey_Service(postIdentifier, othersAESKeyEncrypted)
}
//#endregion
