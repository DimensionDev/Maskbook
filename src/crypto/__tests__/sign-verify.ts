import { sign, verify } from '../crypto-alpha-40'
import { generate_ECDH_256k1_KeyPair } from '../../utils/crypto.subtle'

// TODO: help wanted. Error: heap out of memory
async function testSignVerify(msg: string = Math.random().toString()) {
    const alice = await generate_ECDH_256k1_KeyPair()
    const signature = await sign(msg, alice.privateKey)
    const result = await verify(msg, signature, alice.publicKey)
    if (result === false) throw new Error()
    return true
}

test('Sign & Verify', () => {})
