import * as c from '../crypto-alpha-38'
import { makeTypedMessageText, makeTypedMessageTupleSerializable, makeTypedMessageUnknown } from '@masknet/shared'
import { encodeText, encodeArrayBuffer, decodeText } from '../../utils/type-transform/String-ArrayBuffer'
import { recover_ECDH_256k1_KeyPair_ByMnemonicWord } from '../../utils/mnemonic-code'
import { CryptoWorker } from '../../modules/workers'
import { derive_AES_GCM_256_Key_From_PBKDF2 } from '../../modules/CryptoAlgorithm/helper'

function helper(x: any) {
    if (x instanceof ArrayBuffer) return toString(x)
    if (x instanceof Buffer) return toString(x)
    for (const k in x) {
        const v = x[k]
        x[k] = toString(v)
    }
    return x
    function toString(x: any) {
        if (x instanceof ArrayBuffer) return encodeArrayBuffer(x)
        if (x.buffer instanceof ArrayBuffer) return encodeArrayBuffer(x.buffer)
        return x
    }
}
async function aesFromSeed(seed: string) {
    const pbkdf2 = await CryptoWorker.import_pbkdf2(encodeText(seed))
    return derive_AES_GCM_256_Key_From_PBKDF2(pbkdf2, encodeText('iv'))
}

beforeAll(() => {
    spyOn(globalThis.console, 'warn')
})

// Test for:
// c.typedMessageParse && c.typedMessageStringify
test('Crypto alpha v38 Typed Message', () => {
    const textWith0Meta = makeTypedMessageText('text message1')
    const textWith1Meta = makeTypedMessageText('text message', new Map([['MetadataKey', 'MetadataValue']]))
    const textWith2Meta = makeTypedMessageText(
        'text message',
        new Map([
            ['MetadataKey', 'MetadataValue'],
            ['Metadata2', 'MetadataValue2'],
        ]),
    )
    const text1 = `text message1`
    const text2 = `{"MetadataKey":"MetadataValue"}🧩text message`
    const text3 = `{"MetadataKey":"MetadataValue","Metadata2":"MetadataValue2"}🧩text message`
    expect(c.typedMessageStringify(textWith0Meta)).toBe(text1)
    expect(c.typedMessageStringify(textWith1Meta)).toBe(text2)
    expect(c.typedMessageStringify(textWith2Meta)).toBe(text3)

    expect(c.typedMessageParse(text1)).toStrictEqual(textWith0Meta)
    expect(c.typedMessageParse(text2)).toStrictEqual(textWith1Meta)
    expect(c.typedMessageParse(text3)).toStrictEqual(textWith2Meta)

    // Test inputs that v38 refuse to resolve
    const compound = makeTypedMessageTupleSerializable([textWith2Meta])
    expect(() => c.typedMessageStringify(compound)).toThrow()

    const unk = makeTypedMessageUnknown()
    expect(() => c.typedMessageStringify(unk)).toThrow()

    // Test bad style input
    expect(c.typedMessageParse(`Non-metadata🧩text message`)).toMatchInlineSnapshot(`
        Object {
          "content": "Non-metadata🧩text message",
          "meta": undefined,
          "type": "text",
          "version": 1,
        }
    `)
})

// Test for:
// c.encryptComment && c.decryptComment
test('Crypto alpha v38 Comment encryption', () => {
    const iv = 'random iv'
    const postContent = 'post content'
    const comment = 'comment'
    const encrypted = '🎶2/4|J3BsHIU5r2B8eQmX1f0Xb/9AAeCYnp0=:||'
    expect(c.encryptComment(iv, postContent, comment)).resolves.toBe(encrypted)
    expect(c.decryptComment(iv, postContent, encrypted)).resolves.toBe(comment)
    expect(c.decryptComment(iv, postContent, 'bad input')).resolves.toBeNull()
})

// Test for:
// c.decryptWithAES && c.encryptWithAES
test('Crypto alpha v38 AES encryption/decryption', async () => {
    const k = await aesFromSeed('An AES key')
    // TODO: help wanted, failed by unknown reason
    // expect(await c.encryptWithAES({ aesKey: k, content: 'my content', iv: encodeText('my iv') }).then(helper))
    //     .toMatchInlineSnapshot(`
    //     Object {
    //       "content": "pR9hqEiKDyR6CiF95+QWLU8P9jAvb83fFhs=",
    //       "iv": "bXkgaXY=",
    //     }
    // `)
    expect(
        await c
            .decryptWithAES({
                aesKey: k,
                encrypted: 'pR9hqEiKDyR6CiF95+QWLU8P9jAvb83fFhs=',
                iv: encodeText('my iv'),
            })
            .then(decodeText),
    ).toMatchInlineSnapshot(`"my content"`)
})

// Test for:
// c.encrypt1To1 && c.decryptMessage1To1
// This function is not stable (it will generate a new iv every time)
// test is in the ./1to1

// Test for:
// c.encrypt1ToN && c.decryptMessage1To1 && c.decryptMessage1ToNByMyself && c.decryptMessage1ToNByOther
// This function is not stable (it will generate a new iv every time)
// test is in the ./1toN

// Test for:
c.publicSharedAESKey
test('Crypto alpha v38 publicSharedAESKey', () => {
    // ! Important. If you change this key, it will break the function of public shared
    expect(c.publicSharedAESKey).toMatchInlineSnapshot(`
Object {
  "alg": "A256GCM",
  "ext": true,
  "k": "3Bf8BJ3ZPSMUM2jg2ThODeLuRRD_-_iwQEaeLdcQXpg",
  "key_ops": Array [
    "encrypt",
    "decrypt",
  ],
  "kty": "oct",
}
`)
})

// Test for:
c.extractAESKeyInMessage
test('Crypto alpha v38 extractAESKeyInMessage', () => {
    // TODO: How to test it? 🤔
})

// Test for:
c.generateOthersAESKeyEncrypted
// This function is not stable (it will generate a new iv every time)
test('Crypto alpha v38 generateOthersAESKeyEncrypted', async () => {
    const alice = await recover_ECDH_256k1_KeyPair_ByMnemonicWord('seed!', 'password!')
    const bob = await recover_ECDH_256k1_KeyPair_ByMnemonicWord('Seed@', 'password@')
    const zoe = await recover_ECDH_256k1_KeyPair_ByMnemonicWord('Seed#', 'password#')
    const key = await aesFromSeed('a key')

    const res = await c.generateOthersAESKeyEncrypted(-38, key, alice.key.privateKey, [
        bob.key.publicKey,
        zoe.key.publicKey,
    ])
    expect(res.length).toBe(2)
    expect(res[0].aesKey).toBeTruthy()
    expect(res[0].receiverKey).toBeTruthy()
    expect(res[1].aesKey).toBeTruthy()
    expect(res[1].receiverKey).toBeTruthy()
})
