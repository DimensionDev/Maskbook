import { queryPersonCryptoKey, getMyPrivateKey, storeKey, generateNewKey } from '../../key-management/keystore-db'
import * as Alpha40 from '../../crypto/crypto-alpha-40'
import { AsyncCall, MessageCenter, OnlyRunInContext } from '@holoflows/kit/es'
import { CryptoName } from '../../utils/Names'
import { addPersonPublicKey } from '../../key-management/people-gun'
import { Person } from './PeopleService'
import { getMyLocalKey } from '../../key-management/local-db'
import { publishPostAESKey as publishPostAESKey_Service, queryPostAESKey } from '../../key-management/posts-gun'

import {
    decodeText,
    encodeArrayBuffer,
    toCompressSecp256k1Point,
    unCompressSecp256k1Point,
    decodeArrayBuffer,
} from '../../utils/EncodeDecode'

OnlyRunInContext('background', 'EncryptService')
// v40: 🎼2/4|ownersAESKeyEncrypted|iv|encryptedText|signature:||
//#region Encrypt & Decrypt
type EncryptedText = string
type OthersAESKeyEncryptedToken = string
/**
 * This map stores <token, othersAESKeyEncrypted>.
 */
const OthersAESKeyEncryptedMap = new Map<OthersAESKeyEncryptedToken, Record<string, Alpha40.PublishedAESKey>>()
/**
 * Encrypt to a user
 * @param content Original text
 * @param to Encrypt target
 * @returns Will return a tuple of [encrypted: string, token: string] where
 * - `encrypted` is the encrypted string
 * - `token` is used to call `publishPostAESKey` before post the content
 */
async function encryptTo(content: string, to: Person[]): Promise<[EncryptedText, OthersAESKeyEncryptedToken]> {
    if (to.length === 0) return ['', '']
    const toKey = (await Promise.all(
        to.map(async person => ({ name: person.username, key: await queryPersonCryptoKey(person.username) })),
    )).map(person => ({ name: person.name, key: (person.key === null ? null : person.key.key.publicKey)! }))
    toKey.forEach(x => {
        if (x.key === null) throw new Error(`${x.name}'s public key not found!`)
    })

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
    const str = `2/4|${encodeArrayBuffer(ownersAESKeyEncrypted)}|${encodeArrayBuffer(iv)}|${encodeArrayBuffer(
        encryptedText,
    )}`
    const signature = encodeArrayBuffer(await Alpha40.sign(str, mine!.key.privateKey))
    // Store AES key to gun
    const stored: Record<string, Alpha40.PublishedAESKey> = {}
    for (const k of othersAESKeyEncrypted) {
        stored[k.name] = k.key
    }
    const key = encodeArrayBuffer(iv)
    OthersAESKeyEncryptedMap.set(key, stored)
    return [`https://Maskbook.io : 🎼${str}|${signature}:||`, key]
}
/**
 * MUST call before send post, or othersAESKeyEncrypted will not be published to the internet!
 * @param token Token that returns in the encryptTo
 */
async function publishPostAESKey(token: string) {
    if (!OthersAESKeyEncryptedMap.has(token)) throw new Error('Publish AES key failed!')
    return publishPostAESKey_Service(token, OthersAESKeyEncryptedMap.get(token)!)
}

/**
 * Decrypt message from a user
 * @param encrypted post
 * @param by Post by
 * @param whoAmI My username
 */
async function decryptFrom(
    encrypted: string,
    by: string,
    whoAmI: string,
): Promise<{ signatureVerifyResult: boolean; content: string }> {
    const [version, ownersAESKeyEncrypted, salt, encryptedText, signature] = encrypted.split('|')
    if (!version || !ownersAESKeyEncrypted || !salt || !encryptedText || !signature)
        throw new TypeError('This post is not complete, you need to view the full post.')
    // 2/4 === version 40
    if (version !== '2/4') throw new TypeError('Unknown post type')
    if (!ownersAESKeyEncrypted || !salt || !encryptedText || !signature) throw new TypeError('Invalid post')
    async function getKey(name: string) {
        let key = await queryPersonCryptoKey(by)
        if (!key) key = await addPersonPublicKey(name)
        if (!key) throw new Error(`${name}'s public key not found.`)
        return key
    }
    const byKey = await getKey(by)
    const mine = (await getMyPrivateKey())!
    try {
        const unverified = [version, ownersAESKeyEncrypted, salt, encryptedText].join('|')
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
                throw new Error(
                    'Maskbook does not find the key used to decrypt this post. Maybe this post is not intended to share with you?',
                )
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
                const signatureVerifyResult = await Alpha40.verify(unverified, signature, byKey.key.publicKey)
                return { signatureVerifyResult, content }
            } catch {
                return { signatureVerifyResult: false, content }
            }
        }
    } catch (e) {
        if (e instanceof DOMException) throw new Error('DOMException')
        else throw e
    }
}
//#endregion

//#region ProvePost, create & verify
async function getMyProveBio() {
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
        throw new Error('Key parse failed')
    }
    storeKey({ username: othersName, key: { publicKey: publicKey } })
    return publicKey
}
//#endregion

const Impl = {
    encryptTo,
    decryptFrom,
    getMyProveBio,
    verifyOthersProve,
    publishPostAESKey,
}
Object.assign(window, { encryptService: Impl, crypto40: Alpha40 })
export type Encrypt = typeof Impl
AsyncCall(Impl, { key: CryptoName })
