import './setup'
import { test, expect } from '@jest/globals'
import {
    decrypt,
    DecryptIntermediateProgressKind,
    DecryptIO,
    DecryptProgressKind,
    encrypt,
    EncryptIO,
    EncryptOptions,
    parsePayload,
} from '../src'
import { importAESFromJWK } from '../src/utils'
import { ProfileIdentifier } from '@masknet/shared-base'
import { makeTypedMessageText } from '@masknet/typed-message'

const publicTarget: EncryptOptions['target'] = {
    type: 'public',
}
const example: EncryptOptions = {
    version: -38,
    author: ProfileIdentifier.unknown,
    message: makeTypedMessageText('hello world'),
    target: publicTarget,
}
test('v37 public encryption', async () => {
    await testSet('minimal v38', example, minimalEncryptIO)
    await testSet('minimal v37', { ...example, version: -37 }, minimalEncryptIO)
})

async function testSet(key: string, options: EncryptOptions, io: EncryptIO, waitE2E = false) {
    const a = await encrypt(options, io)
    expect(a).toMatchSnapshot(key)

    const a1 = (await parsePayload(a.output)).unwrap()
    expect(a1).toMatchSnapshot(key + ' parsed')

    const result: any[] = []
    for await (const a2 of decrypt({ message: a1 }, minimalDecryptIO)) {
        result.push(a2)

        if (
            !waitE2E &&
            a2.type === DecryptProgressKind.Progress &&
            a2.event === DecryptIntermediateProgressKind.TryDecryptByE2E
        ) {
            // this is an infinite decrypt generator
            break
        }
    }
    expect(result).toMatchSnapshot(key + ' decrypted')
}

const minimalEncryptIO: EncryptIO = {
    queryLinkedPersona: reject,
    queryLocalKey: reject,
    queryPrivateKey: reject,
    queryPublicKey: returnNull,

    getRandomECKey: reject,
    getRandomValues: mockIV,
    getRandomAESKey: returnTestKey,
}
const minimalDecryptIO: DecryptIO = {
    decryptByLocalKey: reject,
    deriveAESKey: reject,
    deriveAESKey_version38_or_older: reject,
    getPostKeyCache: returnNull,
    hasLocalKeyOf: async () => false,
    queryAuthorPublicKey: returnNull,
    queryPostKey_version37: rejectGenerator,
    queryPostKey_version38: rejectGenerator,
    queryPostKey_version39: rejectGenerator,
    queryPostKey_version40: reject,
    setPostKeyCache: returnVoid,
}
function mockIV(arr: Uint8Array) {
    arr.set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15])
    return arr
}
const testKey = {
    alg: 'A256GCM',
    ext: true,
    /* cspell:disable-next-line */
    k: 'JRhrRKykmnm3SbuNw6OcXF_jiw0gIlW3QiWNV01jeaE',
    key_ops: ['encrypt', 'decrypt'],
    kty: 'oct',
}

async function reject(): Promise<any> {
    throw new Error('should not be called')
}
async function* rejectGenerator() {
    throw new Error('should not be called')
}
async function returnNull(): Promise<null> {
    return null
}
async function returnVoid(): Promise<void> {}
async function returnTestKey() {
    return (await importAESFromJWK.AES_GCM_256(testKey)).unwrap()
}
