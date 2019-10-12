import { sign, verify } from '../crypto/crypto-alpha-40'
import { generate_ECDH_256k1_KeyPair } from '../utils/crypto.subtle'

async function testSignVerify(msg: string = 'test string') {
    const alice = await generate_ECDH_256k1_KeyPair()
    const signature = await sign(msg, alice.privateKey)
    const result = await verify(msg, signature, alice.publicKey)
    if (result === false) throw new Error()
}
testSignVerify()
Object.assign(window, { testSignVerify })
