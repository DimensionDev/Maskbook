import { sign, verify } from '../crypto/crypto-alpha-40'

async function testSignVerify(msg: string = 'test string') {
    const alice = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'K-256' }, true, ['deriveKey'])
    const signature = await sign(msg, alice.privateKey)
    const result = await verify(msg, signature, alice.publicKey)
    if (result === false) throw new Error()
}
testSignVerify()
Object.assign(window, { testSignVerify })
