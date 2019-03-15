import { encryptText, decryptText, verify } from '../../crypto/crypto'
import { queryPersonCryptoKey, getMyPrivateKey } from '../../key-management/db'
import { AsyncCall, MessageCenter } from '@holoflows/kit/es'
import { EncryptName } from '../../utils/Names'

if (location.protocol !== 'chrome-extension:') {
    throw new TypeError('EncryptService run in wrong context. (Should be chrome-extension:)')
}
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
    const byKey = await queryPersonCryptoKey(by)
    if (!byKey) throw new Error(`${byKey}'s public key not found.`)
    const toKey = await queryPersonCryptoKey(to)
    if (!toKey) throw new Error(`${toKey}'s public key not found.`)

    const mine = (await getMyPrivateKey())!
    const result = await decryptText(encrypted, salt, mine.key.privateKey, byKey.key.publicKey)

    const signedBy = by === whoAmI ? mine.key.publicKey : toKey.key.publicKey
    const signature = await verify(result, sig, signedBy)
    return { signatureVerifyResult: signature, content: result }
}

const EncryptService = {
    encryptTo,
    decryptFrom,
}
export type Encrypt = typeof EncryptService
AsyncCall<Encrypt, {}>(EncryptName, EncryptService, {}, MessageCenter, true)
