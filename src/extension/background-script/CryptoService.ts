import { encryptText, decryptText, verify, sign } from '../../crypto/crypto'
import { queryPersonCryptoKey, getMyPrivateKey, storeKey, generateNewKey } from '../../key-management/db'
import { AsyncCall, MessageCenter, OnlyRunInContext } from '@holoflows/kit/es'
import { CryptoName } from '../../utils/Names'
import { encodeArrayBuffer } from '../../utils/EncodeDecode'
import { addPersonPublicKey } from '../../key-management'
import { timeout } from '../../utils/utils'

OnlyRunInContext('background', 'EncryptService')
//#region Encrypt & Decrypt
/**
 * Encrypt to a user
 * @param content Original text
 * @param to Encrypt target
 */
async function encryptTo(content: string, to: string) {
    const toKey = await queryPersonCryptoKey(to)
    if (!toKey) throw new Error(`${to}'s public key not found.`)

    const mine = await getMyPrivateKey()
    return encryptText(content, mine!.key.privateKey, toKey.key.publicKey)
}

/**
 * Decrypt message from a user
 * @param encrypted Encrypted text
 * @param sig Signature
 * @param salt Salt
 * @param by Post by
 * @param to Post to
 * @param whoAmI My username
 */
async function decryptFrom(encrypted: string, sig: string, salt: string, by: string, to: string, whoAmI: string) {
    async function getKey(name: string) {
        let key = await queryPersonCryptoKey(by)
        if (!key) key = await timeout(addPersonPublicKey(name), 5000)
        if (!key) throw new Error(`${name}'s public key not found.`)
        return key
    }
    const byKey = await getKey(by)
    const toKey = await getKey(to)

    const mine = (await getMyPrivateKey())!
    const result = await decryptText(encrypted, salt, mine.key.privateKey, byKey.key.publicKey)

    const signedBy = by === whoAmI ? mine.key.publicKey : toKey.key.publicKey
    const signature = await verify(result, sig, signedBy)
    return { signatureVerifyResult: signature, content: result }
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
    const signature = await sign(post, myKey.key.privateKey!)
    post = post + '|' + encodeArrayBuffer(signature)
    return post
}
async function verifyOthersProvePost(post: string, othersName: string) {
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
    const verifyResult = await verify(post.split('|')[0], signature, publicKey)
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
}
Object.assign(window, { encryptService: Impl })
export type Encrypt = typeof Impl
AsyncCall<Encrypt, {}>(CryptoName, Impl, {}, MessageCenter, true)
