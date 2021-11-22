import './setup'
import { test, expect } from '@jest/globals'
import { None } from 'ts-results'
import { encodePayload, AESAlgorithmEnum, parsePayload, PayloadWellFormed } from '../src'
import { importAESFromJWK } from '../src/utils'

test('Encode v37 payload', async () => {
    const payload: PayloadWellFormed.Payload = {
        version: -37,
        signature: None,
        author: None,
        authorPublicKey: None,
        encrypted: new Uint8Array([0, 1, 2, 3, 4]),
        encryption: {
            type: 'public',
            iv: new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]),
            AESKey: await getAESKey(),
        },
    }
    const encoded = (await encodePayload.NoSign(payload).then((x) => x.unwrap())) as Uint8Array
    expect(encoded).toBeInstanceOf(Uint8Array)

    // These two steps are intended to make sure this Uint8Array is not a partial view to a larger ArrayBuffer.
    expect(encoded.byteOffset).toBe(0)
    expect(encoded.buffer.byteLength).toBe(encoded.length)

    expect(encoded).toMatchSnapshot('Empty payload')

    const parsed = await parsePayload(encoded).then((x) => x.unwrap())
    expect(parsed).toMatchSnapshot('Empty payload parsed')
})
async function getAESKey(): Promise<PayloadWellFormed.PublicEncryption['AESKey']> {
    return {
        algr: AESAlgorithmEnum.A256GCM,
        key: (await importAESFromJWK.AES_GCM_256(testKey)).unwrap(),
    }
}
const testKey = {
    alg: 'A256GCM',
    ext: true,
    /* cspell:disable-next-line */
    k: 'JRhrRKykmnm3SbuNw6OcXF_jiw0gIlW3QiWNV01jeaE',
    key_ops: ['encrypt', 'decrypt'],
    kty: 'oct',
}
