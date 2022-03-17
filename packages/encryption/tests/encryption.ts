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
import { makeTypedMessageText, makeTypedMessageTupleSerializable } from '@masknet/typed-message'
import { deriveAESKey, getRandomValues, getTestRandomAESKey, getTestRandomECKey, queryTestPublicKey } from './keys'

const publicTarget: EncryptOptions['target'] = {
    type: 'public',
}
const example: EncryptOptions = {
    version: -38,
    author: new ProfileIdentifier('localhost', 'alice'),
    message: makeTypedMessageText('hello world'),
    target: publicTarget,
}
test('v37 public encryption', async () => {
    await testSet('minimal v37', { ...example, version: -37 })

    await testSet(
        'full v37',
        {
            version: -37,
            target: publicTarget,
            message: complexMessage(),
            author: example.author,
        },
        {
            ...minimalEncryptIO,
            queryPublicKey: queryTestPublicKey,
        },
    )
})

test('v38 public encryption', async () => {
    await testSet('minimal v38', example)

    await testSet(
        'full v38',
        {
            version: -38,
            target: publicTarget,
            message: makeTypedMessageText('hello world'),
            author: example.author,
        },
        {
            ...minimalEncryptIO,
            queryPublicKey: queryTestPublicKey,
        },
    )
})

test('v37 E2E encryption', async () => {
    const payload: EncryptOptions = {
        author: new ProfileIdentifier('localhost', 'bob'),
        message: makeTypedMessageText('hello world'),
        target: {
            type: 'E2E',
            target: [new ProfileIdentifier('localhost', 'jack')],
        },
        version: -37,
    }

    const encrypted = await encrypt(payload, {
        encryptByLocalKey: reject,
        deriveAESKey_version38_or_older: reject,
        queryPublicKey: queryTestPublicKey,
        getRandomAESKey: getTestRandomAESKey(),
        getRandomECKey: getTestRandomECKey(),
        getRandomValues: getRandomValues(),
    })
    expect(encrypted).toMatchSnapshot('encrypted')

    const parsed = (await parsePayload(encrypted.output)).unwrap()
    expect(parsed).toMatchSnapshot('parsed')

    // decrypt as author
    {
        const result: any[] = []
        const decryptIO: DecryptIO = {
            ...minimalDecryptIO,
            deriveAESKey: deriveAESKey('bob'),
        }
        for await (const progress of decrypt({ message: parsed }, decryptIO)) {
            result.push(progress)
        }
        expect(result).toMatchSnapshot('decrypted as author')
    }

    // decrypt as jack
    {
        const result: any[] = []
        const decryptIO: DecryptIO = {
            ...minimalDecryptIO,
            deriveAESKey: deriveAESKey('jack'),
            async *queryPostKey_version37() {
                for (const [, each] of encrypted.e2e!) {
                    if (each.status === 'rejected') continue
                    yield { encryptedPostKey: each.value.encryptedPostKey }
                }
            },
        }
        for await (const progress of decrypt({ message: parsed }, decryptIO)) {
            result.push(progress)
        }
        expect(result).toMatchSnapshot('decrypted as jack')
    }
})
test('v38 E2E encryption', async () => {})

async function testSet(
    key: string,
    options: EncryptOptions,
    io = minimalEncryptIO,
    decryptIO = minimalDecryptIO,
    waitE2E = false,
) {
    const a = await encrypt(options, io)
    expect(a).toMatchSnapshot(key)

    const a1 = (await parsePayload(a.output)).unwrap()
    expect(a1).toMatchSnapshot(key + ' parsed')

    const result: any[] = []
    for await (const a2 of decrypt({ message: a1 }, decryptIO)) {
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
    queryPublicKey: returnNull,
    deriveAESKey_version38_or_older: reject,
    encryptByLocalKey: reject,

    getRandomECKey: reject,
    getRandomValues: mockIV,
    getRandomAESKey: returnTestKey,
}
const minimalDecryptIO: DecryptIO = {
    decryptByLocalKey: reject,
    deriveAESKey: reject,
    deriveAESKey_version38_or_older: reject,
    getPostKeyCache: returnNull,
    hasLocalKeyOf: returnFalse,
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
async function returnFalse(): Promise<boolean> {
    return false
}
async function returnTestKey() {
    return (await importAESFromJWK.AES_GCM_256(testKey)).unwrap()
}

function complexMessage() {
    const meta = new Map<string, any>()
    meta.set('io.plugin.something', {
        num: 2345,
        str: '123',
        nul: null,
        dict: { a: [1, 2], b: true, c: false },
    })
    return makeTypedMessageTupleSerializable([makeTypedMessageText('hi'), makeTypedMessageText('text 2')], meta)
}
