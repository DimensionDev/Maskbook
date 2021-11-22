import './setup'
import { test, expect } from '@jest/globals'
import { None, Some } from 'ts-results'
import { encodePayload, AESAlgorithmEnum, parsePayload, PayloadWellFormed, PublicKeyAlgorithmEnum } from '../src'
import { importAESFromJWK, importAsymmetryKeyFromJsonWebKeyOrSPKI } from '../src/utils'
import { ProfileIdentifier } from '@masknet/shared-base'
import { ECDH_K256_PublicKey } from './setup'

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
    // test 1
    {
        const encoded = (await encodePayload.NoSign(payload).then((x) => x.unwrap())) as Uint8Array
        expect(encoded).toBeInstanceOf(Uint8Array)

        // These two steps are intended to make sure this Uint8Array is not a partial view to a larger ArrayBuffer.
        expect(encoded.byteOffset).toBe(0)
        expect(encoded.buffer.byteLength).toBe(encoded.length)

        expect(encoded).toMatchSnapshot('Empty payload')

        const parsed = await parsePayload(encoded).then((x) => x.unwrap())
        expect(parsed).toMatchSnapshot('Empty payload parsed')
    }
    // test 2
    {
        const newPayload = { ...payload }
        newPayload.author = Some(new ProfileIdentifier('localhost', 'unknown'))
        const k256Key = (
            await importAsymmetryKeyFromJsonWebKeyOrSPKI(ECDH_K256_PublicKey, PublicKeyAlgorithmEnum.secp256k1)
        ).unwrap()
        newPayload.authorPublicKey = Some({
            algr: PublicKeyAlgorithmEnum.secp256k1,
            key: k256Key,
        })
        newPayload.encryption = {
            type: 'E2E',
            iv: payload.encryption.iv,
            ephemeralPublicKey: new Map([[PublicKeyAlgorithmEnum.secp256k1, k256Key]]),
            ownersAESKeyEncrypted: new Uint8Array([5, 6, 7, 8, 9, 10]),
        }

        const encoded = (await encodePayload.NoSign(newPayload).then((x) => x.unwrap())) as Uint8Array
        expect(encoded).toMatchSnapshot('Full payload')

        const parsed = await parsePayload(encoded).then((x) => x.unwrap())
        expect(parsed).toMatchSnapshot('Full payload parsed')
    }
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
