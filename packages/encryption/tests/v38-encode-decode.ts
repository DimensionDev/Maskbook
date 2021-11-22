import './setup'
import { expect, test } from '@jest/globals'
import { AESAlgorithmEnum, encodePayload, parsePayload, PayloadWellFormed, PublicKeyAlgorithmEnum } from '../src'
import { None, Some } from 'ts-results'
import { ProfileIdentifier } from '@masknet/shared-base'
import { importAESFromJWK, importAsymmetryKeyFromJsonWebKeyOrSPKI } from '../src/utils'

test('Parse v38 encoded by old infra', async () => {
    const out = (await parsePayload(oldInfraOutput)).unwrap()
    expect(out).toMatchSnapshot('Parse v38 payload result')
})

test('Parse older v38 payload that does not have newer field', async () => {
    const out = (await parsePayload(oldInfraOutputShort)).unwrap()
    expect(out).toMatchSnapshot('Parse older v38 payload result')
})

test('Encode v38 payload', async () => {
    const payload: PayloadWellFormed.Payload = {
        author: Some(new ProfileIdentifier('facebook.com', 'test')),
        authorPublicKey: Some({
            algr: PublicKeyAlgorithmEnum.secp256k1,
            key: (
                await importAsymmetryKeyFromJsonWebKeyOrSPKI(ECDHPublicKey, PublicKeyAlgorithmEnum.secp256k1)
            ).unwrap(),
        }),
        encrypted: new Uint8Array(Buffer.from('3a0d6ee692c6f46896b196f14301c01ad2fa26aa', 'hex')),
        encryption: {
            type: 'public',
            iv: new Uint8Array(Buffer.from('0633db7e24805c2bdcff69ea2afda7cd', 'hex')),
            AESKey: {
                algr: AESAlgorithmEnum.A256GCM,
                key: await importAESFromJWK(AESKey, AESAlgorithmEnum.A256GCM).then((x) => x.unwrap() as any),
            },
        },
        signature: None,
        version: -38,
    }

    const result = await encodePayload.NoSign(payload).then((x) => x.unwrap())
    expect(result).toMatchSnapshot('Encoded v38 message')

    const parsed = await parsePayload(result)
    expect(parsed).toMatchSnapshot('Parse generated v38 message')
})

/* cspell:disable-next-line */
const oldInfraOutput = `🎼4/4|avkwBKqMpCKznGclvChuuh2AEExV0J14xI/KANhwiKJfVyfm2ObWb432E3aAOa7ImRoCd7/JK1dDQWk4rt9NqajTEaajARMc9hJ9GmR8lorBNRNHlgj/h1KJYk5th7Nsr04PWO0nJUKiDH2CJwieSxW2YqxCI1ceYKUYcZOsVJEZOrJ/IB8WUmU0|BjPbfiSAXCvc/2nqKv2nzQ==|Og1u5pLG9GiWsZbxQwHAGtL6Jqo=|_|Aq/bVWAKvodJuURGk3enjE1gUiu2SELM8IIKIlNGqOWM|1|ZmFjZWJvb2suY29tLzEwMDAyNzU2MjI0OTU3NA==:||`
/* cspell:disable-next-line */
const oldInfraOutputShort = `🎼4/4|avkwBKqMpCKznGclvChuuh2AEExV0J14xI/KANhwiKJfVyfm2ObWb432E3aAOa7ImRoCd7/JK1dDQWk4rt9NqajTEaajARMc9hJ9GmR8lorBNRNHlgj/h1KJYk5th7Nsr04PWO0nJUKiDH2CJwieSxW2YqxCI1ceYKUYcZOsVJEZOrJ/IB8WUmU0|BjPbfiSAXCvc/2nqKv2nzQ==|Og1u5pLG9GiWsZbxQwHAGtL6Jqo=|_:||`
const ECDHPublicKey = {
    x: 'r9tVYAq-h0m5REaTd6eMTWBSK7ZIQszwggoiU0ao5Yw',
    /* cspell:disable-next-line */
    y: 'kx1ZdZAABlMcRqc_hLM6A3Vd--Vn7FBMRw3SREQN1j4',
    ext: true,
    key_ops: ['deriveKey', 'deriveBits'],
    crv: 'K-256',
    kty: 'EC',
}
const AESKey = {
    key_ops: ['encrypt', 'decrypt'],
    ext: true,
    kty: 'oct',
    /* cspell:disable-next-line */
    k: 'JrotLWI_e9OUOXzONFPthyMq-EyHdtp9vlAE9iAI9Gc',
    alg: 'A256GCM',
}
