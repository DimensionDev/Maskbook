import { encrypt1ToN, decryptMessage1ToNByMyself, decryptMessage1ToNByOther } from '../crypto/crypto-alpha-40'
import { decodeText } from '../utils/type-transform/EncodeDecode'

async function test1toN(msg: string) {
    const alice = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'K-256' }, true, ['deriveKey'])
    const aliceLocal = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
    const bob = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'K-256' }, true, ['deriveKey'])
    const david = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'K-256' }, true, ['deriveKey'])
    const zoe = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'K-256' }, true, ['deriveKey'])

    const encrypted = await encrypt1ToN({
        version: -40,
        content: msg,
        iv: crypto.getRandomValues(new Uint8Array(16)),
        privateKeyECDH: alice.privateKey,
        othersPublicKeyECDH: [{ key: bob.publicKey, name: 'bob' }, { key: david.publicKey, name: 'david' }],
        ownersLocalKey: aliceLocal,
    })

    const aliceDecrypt = await decryptMessage1ToNByMyself({
        version: -40,
        encryptedAESKey: encrypted.ownersAESKeyEncrypted,
        encryptedContent: encrypted.encryptedContent,
        iv: encrypted.iv,
        myLocalKey: aliceLocal,
    })
    if (decodeText(aliceDecrypt) !== msg) throw new Error('Alice decrypted not equal')

    const bobDecrypt = await decryptMessage1ToNByOther({
        version: -40,
        AESKeyEncrypted: encrypted.othersAESKeyEncrypted.find(x => x.name === 'bob')!.key,
        authorsPublicKeyECDH: alice.publicKey,
        encryptedContent: encrypted.encryptedContent,
        iv: encrypted.iv,
        privateKeyECDH: bob.privateKey,
    })
    if (decodeText(bobDecrypt) !== msg) throw new Error('Bob decrypted not equal')

    try {
        await decryptMessage1ToNByOther({
            version: -40,
            AESKeyEncrypted: encrypted.othersAESKeyEncrypted.find(x => x.name === 'bob')!.key,
            authorsPublicKeyECDH: alice.publicKey,
            encryptedContent: encrypted.encryptedContent,
            iv: encrypted.iv,
            privateKeyECDH: zoe.privateKey,
        })
        throw new Error('Zoe decrypted success')
    } catch {}
}
Object.assign(window, { test1toN })
