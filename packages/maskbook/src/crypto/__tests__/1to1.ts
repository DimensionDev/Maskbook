import * as crypto38 from '../crypto-alpha-38'
import { decodeText } from '@dimensiondev/kit'
import { CryptoWorker } from '../../modules/workers'
async function test1to1(text: string = Math.random().toString()) {
    const alice = await CryptoWorker.generate_ec_k256_pair()
    const bob = await CryptoWorker.generate_ec_k256_pair()

    const encrypted = await crypto38.encrypt1To1({
        content: text,
        privateKeyECDH: alice.privateKey,
        othersPublicKeyECDH: bob.publicKey,
        version: -38,
    })
    const decrypted = await crypto38.decryptMessage1To1({
        encryptedContent: encrypted.encryptedContent,
        salt: encrypted.salt,
        privateKeyECDH: bob.privateKey,
        anotherPublicKeyECDH: alice.publicKey,
        version: -40,
    })
    if (decodeText(decrypted) !== text) throw new Error('')
}
test('1 to 1 encryption', () => test1to1())
