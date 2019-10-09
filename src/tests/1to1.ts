import * as crypto40 from '../crypto/crypto-alpha-40'
import { decodeText } from '../utils/type-transform/String-ArrayBuffer'
import { generate_ECDH_256k1_KeyPair } from '../utils/crypto.subtle'
async function test1to1(text: string = 'test string') {
    const alice = await generate_ECDH_256k1_KeyPair()
    const bob = await generate_ECDH_256k1_KeyPair()

    const encrypted = await crypto40.encrypt1To1({
        content: text,
        privateKeyECDH: alice.privateKey,
        othersPublicKeyECDH: bob.publicKey,
        version: -38,
    })
    const decrypted = await crypto40.decryptMessage1To1({
        encryptedContent: encrypted.encryptedContent,
        salt: encrypted.salt,
        privateKeyECDH: bob.privateKey,
        anotherPublicKeyECDH: alice.publicKey,
        version: -40,
    })
    if (decodeText(decrypted) !== text) throw new Error()
}
test1to1()
Object.assign(window, { test1to1 })
