import { queryPersonCryptoKey, getMyPrivateKey, storeKey, generateNewKey } from '../../key-management/keystore-db'
import * as Alpha41 from '../../crypto/crypto-alpha-41'
import { AsyncCall, MessageCenter, OnlyRunInContext } from '@holoflows/kit/es'
import { CryptoName } from '../../utils/Names'
import { addPersonPublicKey } from '../../key-management/people-gun'
import { timeout } from '../../utils/utils'
import { Person } from './PeopleService'
import { getMyLocalKey } from '../../key-management/local-db'
import { publishPostAESKey, queryPostAESKey } from '../../key-management/posts-gun'

import { debounce } from 'lodash-es'
import { decodeText, encodeArrayBuffer, encodeTextOrange, decodeTextOrange } from '../../utils/EncodeDecode'

OnlyRunInContext('background', 'EncryptService')
const publishPostAESKeyDebounce = debounce(publishPostAESKey, 2000, { trailing: true })
/**
 * ! Remember to call requestRegenerateIV !
 */
let lastiv = crypto.getRandomValues(new Uint8Array(16))
async function requestRegenerateIV() {
    lastiv = crypto.getRandomValues(new Uint8Array(16))
}
//#region Encrypt & Decrypt
/**
 * Encrypt to a user
 * @param content Original text
 * @param to Encrypt target
 */
async function encryptTo(content: string, to: Person[]) {
    if (to.length === 0) return ''
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
    } = await Alpha41.encrypt1ToN({
        version: -41,
        content: content,
        othersPublicKeyECDH: toKey,
        ownersLocalKey: mineLocal.key,
        privateKeyECDH: mine!.key.privateKey,
        iv: lastiv,
    })
    const str = `${version}|${encodeArrayBuffer(ownersAESKeyEncrypted)}|${encodeArrayBuffer(iv)}|${encodeArrayBuffer(
        encryptedText,
    )}`
    const signature = encodeArrayBuffer(await Alpha41.sign(str, mine!.key.privateKey))
    {
        // Store AES key to gun
        const stored: Record<string, Alpha41.PublishedAESKey> = {}
        for (const k of othersAESKeyEncrypted) {
            stored[k.name] = k.key
        }
        publishPostAESKeyDebounce(encodeArrayBuffer(iv), stored)
    }
    return `${str}|${signature}`
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
    if (version !== '-41') throw new TypeError('Unknown post type')
    if (!ownersAESKeyEncrypted || !salt || !encryptedText || !signature) throw new TypeError('Invalid post')
    async function getKey(name: string) {
        let key = await queryPersonCryptoKey(by)
        if (!key) key = await timeout(addPersonPublicKey(name), 5000)
        if (!key) throw new Error(`${name}'s public key not found.`)
        return key
    }
    const byKey = await getKey(by)
    const mine = (await getMyPrivateKey())!
    try {
        const unverified = [version, ownersAESKeyEncrypted, salt, encryptedText].join('|')
        if (by === whoAmI) {
            const content = decodeText(
                await Alpha41.decryptMessage1ToNByMyself({
                    version: -41,
                    encryptedAESKey: ownersAESKeyEncrypted,
                    encryptedContent: encryptedText,
                    myLocalKey: (await getMyLocalKey()).key,
                    iv: salt,
                }),
            )
            const signatureVerifyResult = await Alpha41.verify(unverified, signature, mine.key.publicKey)
            return { signatureVerifyResult, content }
        } else {
            const content = decodeText(
                await Alpha41.decryptMessage1ToNByOther({
                    version: -41,
                    AESKeyEncrypted: await queryPostAESKey(salt, whoAmI),
                    authorsPublicKeyECDH: byKey.key.publicKey,
                    encryptedContent: encryptedText,
                    privateKeyECDH: mine.key.privateKey,
                    iv: salt,
                }),
            )
            const signatureVerifyResult = await Alpha41.verify(unverified, signature, byKey.key.publicKey)
            return { signatureVerifyResult, content }
        }
    } catch (e) {
        if (e instanceof DOMException) throw new Error('DOMException')
        else throw e
    }
}
//#endregion

//#region ProvePost, create & verify
async function getMyProvePost() {
    let myKey = await getMyPrivateKey()
    if (!myKey) myKey = await generateNewKey()
    const pub = await crypto.subtle.exportKey('jwk', myKey.key.publicKey!)
    let post = `I'm using Maskbook to encrypt my posts to prevent Facebook from peeping into them.
Install Maskbook as well so that you may read my encrypted posts,
and may prevent Facebook from intercepting our communication.
Here is my public key >${btoa(JSON.stringify(pub))}`
    const signature = encodeArrayBuffer(await Alpha41.sign(post, myKey.key.privateKey!))
    post = post + '|' + signature
    return post
}
async function getMyProveBio() {
    let myKey = await getMyPrivateKey()
    if (!myKey) myKey = await generateNewKey()
    const pub = await crypto.subtle.exportKey('jwk', myKey.key.publicKey!)
    let post = `🔒${encodeTextOrange(pub.x!)}🔒${encodeTextOrange(pub.y!)}`
    const signature = encodeArrayBuffer(await Alpha41.sign(post, myKey.key.privateKey))
    post = post + '🔒' + encodeTextOrange(signature) + '🔒'
    return post
}
getMyProveBio().then(console.log)
async function verifyOthersProveBio(bio: string, othersName: string) {
    const [_, x, y, sig, _2] = bio.split('🔒')
    if (!x || !y || !sig) return null
    const key: JsonWebKey = {
        crv: 'K-256',
        ext: true,
        x: decodeTextOrange(x),
        y: decodeTextOrange(y),
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
    const verifyResult = await Alpha41.verify(`🔒${x}🔒${y}`, decodeTextOrange(sig), publicKey)
    if (!verifyResult) throw new Error('Verify Failed!')
    else {
        storeKey({ username: othersName, key: { publicKey: publicKey } })
    }
    return { publicKey, verify: verifyResult }
}
async function verifyOthersProvePost(post: string, othersName: string) {
    // tslint:disable-next-line: no-parameter-reassignment
    post = post.replace(/>(\n.+)$/, '')
    const [_, rest] = post.split('>')
    if (!rest) return null
    const [pub, signature] = rest.split('|')
    if (!pub || !signature) return null
    let publicKey: CryptoKey
    try {
        publicKey = await crypto.subtle.importKey(
            'jwk',
            JSON.parse(atob(pub)),
            { name: 'ECDH', namedCurve: 'K-256' },
            true,
            ['deriveKey'],
        )
    } catch {
        throw new Error('Key parse failed')
    }
    const verifyResult = await Alpha41.verify(post.split('|')[0], signature, publicKey)
    if (!verifyResult) throw new Error('Verify Failed!')
    else {
        storeKey({ username: othersName, key: { publicKey: publicKey } })
    }
    return { publicKey, verify: verifyResult }
}
//#endregion

const Impl = {
    encryptTo,
    decryptFrom,
    getMyProvePost,
    verifyOthersProvePost,
    requestRegenerateIV,
}
Object.assign(window, { encryptService: Impl, crypto41: Alpha41 })
export type Encrypt = typeof Impl
AsyncCall<Encrypt, {}>(CryptoName, Impl, {}, MessageCenter, true)
