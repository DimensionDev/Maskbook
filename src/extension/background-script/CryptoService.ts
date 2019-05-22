import { queryPersonCryptoKey, getMyPrivateKey, storeKey, generateNewKey } from '../../key-management/keystore-db'
import * as Alpha40 from '../../crypto/crypto-alpha-40'
import { OnlyRunInContext } from '@holoflows/kit/es'
import { addPersonPublicKey } from '../../key-management/people-gun'
import { Person, queryPerson } from './PeopleService'
import { getMyLocalKey } from '../../key-management/local-db'
import { publishPostAESKey as publishPostAESKey_Service, queryPostAESKey } from '../../key-management/posts-gun'

import {
    decodeText,
    encodeArrayBuffer,
    toCompressSecp256k1Point,
    unCompressSecp256k1Point,
    decodeArrayBuffer,
} from '../../utils/type-transform/EncodeDecode'
import { gun } from '../../key-management/gun'
import { constructAlpha40, deconstructPayload } from '../../utils/type-transform/Payload'
import { geti18nString } from '../../utils/i18n'

OnlyRunInContext('background', 'EncryptService')
//#region Encrypt & Decrypt
type EncryptedText = string
type OthersAESKeyEncryptedToken = string
/**
 * @internal
 */
async function prepareOthersKeyForEncryption(to: Person[]) {
    const toKey = (await Promise.all(
        to.map(async person => ({ name: person.username, key: await queryPersonCryptoKey(person.username) })),
    )).map(person => ({ name: person.name, key: (person.key === null ? null : person.key.key.publicKey)! }))
    toKey.forEach(x => {
        if (x.key === null) throw new Error(geti18nString('service-others-key-not-found', x.name))
    })
    return toKey
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
export async function encryptTo(content: string, to: Person[]): Promise<[EncryptedText, OthersAESKeyEncryptedToken]> {
    if (to.length === 0) return ['', '']
    const toKey = await prepareOthersKeyForEncryption(to)

    const mine = await getMyPrivateKey()
    const mineLocal = await getMyLocalKey()
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
        ownersLocalKey: mineLocal.key,
        privateKeyECDH: mine!.key.privateKey,
        iv: crypto.getRandomValues(new Uint8Array(16)),
    })
    const ownersAESKeyStr = encodeArrayBuffer(ownersAESKeyEncrypted)
    const ivStr = encodeArrayBuffer(iv)
    const encryptedTextStr = encodeArrayBuffer(encryptedText)
    // ! Don't use payload.ts, this is an internal representation used for signature.
    const str = `2/4|${ownersAESKeyStr}|${ivStr}|${encryptedTextStr}`
    const signature = encodeArrayBuffer(await Alpha40.sign(str, mine!.key.privateKey))

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
    if (!OthersAESKeyEncryptedMap.has(token)) throw new Error(geti18nString('service-publish-post-aes-key-failed'))
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
    by: string,
    whoAmI: string,
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
        async function getKey(name: string) {
            let key = await queryPersonCryptoKey(by)
            try {
                if (!key) key = await addPersonPublicKey(name)
            } catch {
                return null
            }
            return key
        }
        const byKey = await getKey(by)
        if (!byKey) return { error: geti18nString('service-others-key-not-found', by) }
        const mine = (await getMyPrivateKey())!
        try {
            const unverified = ['2/4', ownersAESKeyEncrypted, salt, encryptedText].join('|')
            if (by === whoAmI) {
                const content = decodeText(
                    await Alpha40.decryptMessage1ToNByMyself({
                        version: -40,
                        encryptedAESKey: ownersAESKeyEncrypted,
                        encryptedContent: encryptedText,
                        myLocalKey: (await getMyLocalKey()).key,
                        iv: salt,
                    }),
                )
                try {
                    if (!signature) throw new TypeError('No signature')
                    const signatureVerifyResult = await Alpha40.verify(unverified, signature, mine.key.publicKey)
                    return { signatureVerifyResult, content }
                } catch {
                    return { signatureVerifyResult: false, content }
                }
            } else {
                const aesKeyEncrypted = await queryPostAESKey(salt, whoAmI)
                // TODO: Replace this error with:
                // You do not have the necessary private key to decrypt this message.
                // What to do next: You can ask your friend to visit your profile page, so that their Maskbook extension will detect and add you to recipients.
                // ? after the auto-share with friends is done.
                if (aesKeyEncrypted === undefined) {
                    return {
                        error: geti18nString('service-not-share-target'),
                    }
                }
                const content = decodeText(
                    await Alpha40.decryptMessage1ToNByOther({
                        version: -40,
                        AESKeyEncrypted: aesKeyEncrypted,
                        authorsPublicKeyECDH: byKey.key.publicKey,
                        encryptedContent: encryptedText,
                        privateKeyECDH: mine.key.privateKey,
                        iv: salt,
                    }),
                )
                try {
                    if (!signature) throw new TypeError('No signature')
                    const signatureVerifyResult = await Alpha40.verify(unverified, signature, byKey.key.publicKey)
                    return { signatureVerifyResult, content }
                } catch {
                    return { signatureVerifyResult: false, content }
                }
            }
        } catch (e) {
            if (e instanceof DOMException) {
                console.error(e)
                return { error: geti18nString('service-decryption-failed') }
            } else throw e
        }
    }
    return { error: geti18nString('service-unknown-payload') }
}
//#endregion

//#region ProvePost, create & verify
export async function getMyProveBio() {
    let myKey = await getMyPrivateKey()
    if (!myKey) myKey = await generateNewKey()
    const pub = await crypto.subtle.exportKey('jwk', myKey.key.publicKey!)
    const compressed = toCompressSecp256k1Point(pub.x!, pub.y!)
    return `🔒${encodeArrayBuffer(compressed)}🔒`
}
export async function verifyOthersProve(bio: string, othersName: string) {
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
        throw new Error(geti18nString('service-key-parse-failed'))
    }
    storeKey({ username: othersName, key: { publicKey: publicKey } })
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
    return Promise.all(Object.keys(post).map(queryPerson))
}
export async function appendShareTarget(
    postIdentifier: string,
    ownersAESKeyEncrypted: string,
    iv: string,
    people: Person[],
): Promise<void> {
    const toKey = await prepareOthersKeyForEncryption(people)
    const AESKey = await Alpha40.extractAESKeyInMessage(-40, ownersAESKeyEncrypted, iv, (await getMyLocalKey()).key)
    const othersAESKeyEncrypted = await Alpha40.generateOthersAESKeyEncrypted(
        -40,
        AESKey,
        (await getMyPrivateKey())!.key.privateKey,
        toKey,
    )
    publishPostAESKey_Service(postIdentifier, othersAESKeyEncrypted)
}
//#endregion
