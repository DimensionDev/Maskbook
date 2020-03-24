import { encrypt1ToN, decryptMessage1ToNByMyself, decryptMessage1ToNByOther } from '../crypto-alpha-40'
import { decodeText } from '../../utils/type-transform/String-ArrayBuffer'
import { generate_ECDH_256k1_KeyPair, generate_AES_GCM_256_Key } from '../../utils/crypto.subtle'

async function test1toN(msg: string = Math.random().toString()) {
    const alice = await generate_ECDH_256k1_KeyPair()
    const aliceLocal = await generate_AES_GCM_256_Key()
    const bob = await generate_ECDH_256k1_KeyPair()
    const david = await generate_ECDH_256k1_KeyPair()
    const zoe = await generate_ECDH_256k1_KeyPair()

    const encrypted = await encrypt1ToN({
        version: -40,
        content: msg,
        iv: crypto.getRandomValues(new Uint8Array(16)),
        privateKeyECDH: alice.privateKey,
        othersPublicKeyECDH: [
            { key: bob.publicKey, name: 'bob' },
            { key: david.publicKey, name: 'david' },
        ],
        ownersLocalKey: aliceLocal,
    })

    const [aliceDecrypt] = await decryptMessage1ToNByMyself({
        version: -40,
        encryptedAESKey: encrypted.ownersAESKeyEncrypted,
        encryptedContent: encrypted.encryptedContent,
        iv: encrypted.iv,
        myLocalKey: aliceLocal,
    })
    if (decodeText(aliceDecrypt) !== msg) throw new Error('Alice decrypted not equal')

    const [bobDecrypt] = await decryptMessage1ToNByOther({
        version: -40,
        AESKeyEncrypted: encrypted.othersAESKeyEncrypted.find((x) => x.name === 'bob')!.key,
        authorsPublicKeyECDH: alice.publicKey,
        encryptedContent: encrypted.encryptedContent,
        iv: encrypted.iv,
        privateKeyECDH: bob.privateKey,
    })
    if (decodeText(bobDecrypt) !== msg) throw new Error('Bob decrypted not equal')

    try {
        await decryptMessage1ToNByOther({
            version: -40,
            AESKeyEncrypted: encrypted.othersAESKeyEncrypted.find((x) => x.name === 'bob')!.key,
            authorsPublicKeyECDH: alice.publicKey,
            encryptedContent: encrypted.encryptedContent,
            iv: encrypted.iv,
            privateKeyECDH: zoe.privateKey,
        })
        throw new Error('Zoe decrypted success')
    } catch {}
}
test('1 to N encryption test', () => test1toN())
