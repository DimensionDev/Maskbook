import * as crypto40 from '../crypto/crypto-alpha-40'
import { decodeText } from '../utils/EncodeDecode'
export async function test1to1(text: string) {
    const alice = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'K-256' }, true, ['deriveKey'])
    const bob = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'K-256' }, true, ['deriveKey'])

    const encrypted = await crypto40.encrypt1To1({
        content: text,
        privateKeyECDH: alice.privateKey,
        othersPublicKeyECDH: bob.publicKey,
        version: -40,
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

Object.assign(window, { test1to1 })
