import { test, expect } from '@jest/globals'
import {
    appendEncryptionTarget,
    decrypt,
    DecryptIntermediateProgressKind,
    DecryptIO,
    DecryptProgressKind,
    encrypt,
    EncryptIO,
    EncryptOptions,
    parsePayload,
    importAESFromJWK,
} from '@masknet/encryption'
import { ProfileIdentifier } from '@masknet/shared-base'
import { makeTypedMessageText, makeTypedMessageTupleSerializable } from '@masknet/typed-message'
import {
    deriveAESKey,
    encryptDecryptWith,
    getBobLocalKey,
    getRandomValues,
    getTestRandomAESKey,
    getTestRandomECKey,
    queryTestPublicKey,
} from './keys'

const publicTarget: EncryptOptions['target'] = {
    type: 'public',
}
const example: EncryptOptions = {
    version: -38,
    author: ProfileIdentifier.of('localhost', 'alice').unwrap(),
    message: makeTypedMessageText('hello world'),
    target: publicTarget,
    network: 'localhost',
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
            network: 'localhost',
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
            network: 'localhost',
        },
        {
            ...minimalEncryptIO,
            queryPublicKey: queryTestPublicKey,
        },
    )
})

test('v37 E2E encryption', async () => {
    const payload: EncryptOptions = {
        network: 'localhost',
        author: ProfileIdentifier.of('localhost', 'bob').unwrap(),
        message: makeTypedMessageText('hello world'),
        target: {
            type: 'E2E',
            target: [ProfileIdentifier.of('localhost', 'jack').unwrap()],
        },
        version: -37,
    }

    const encrypted = await encrypt(payload, {
        encryptByLocalKey: reject,
        deriveAESKey: reject,
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
            deriveAESKey: deriveAESKey('bob', 'array'),
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
            deriveAESKey: deriveAESKey('jack', 'array'),
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

    // append another receiver
    const appendResult = await appendEncryptionTarget(
        {
            iv: encrypted.identifier.toIV(),
            postAESKey: encrypted.postKey,
            target: [ProfileIdentifier.of('localhost', 'joey').unwrap()],
            version: -37,
        },
        {
            getRandomValues: getRandomValues(),
            getRandomECKey: getTestRandomECKey(),
            queryPublicKey: queryTestPublicKey,
            deriveAESKey: reject,
        },
    )
    expect(appendResult).toMatchSnapshot('append target to joey')

    // decrypt as joey
    {
        const result: any[] = []
        const decryptIO: DecryptIO = {
            ...minimalDecryptIO,
            deriveAESKey: deriveAESKey('joey', 'array'),
            async *queryPostKey_version37() {
                for (const [, each] of appendResult) {
                    if (each.status === 'rejected') continue
                    yield { encryptedPostKey: each.value.encryptedPostKey }
                }
            },
        }
        for await (const progress of decrypt({ message: parsed }, decryptIO)) {
            result.push(progress)
        }
        expect(result).toMatchSnapshot('decrypted as joey')
    }
})
test('v38 E2E encryption', async () => {
    const payload: EncryptOptions = {
        network: 'localhost',
        author: ProfileIdentifier.of('localhost', 'bob').unwrap(),
        message: makeTypedMessageText('hello world'),
        target: {
            type: 'E2E',
            target: [ProfileIdentifier.of('localhost', 'jack').unwrap()],
        },
        version: -38,
    }

    const { decrypt: decryptByBobLocalKey, encrypt: encryptByBobLocalKey } = encryptDecryptWith(getBobLocalKey)
    const encrypted = await encrypt(payload, {
        encryptByLocalKey: encryptByBobLocalKey,
        deriveAESKey: deriveAESKey('bob', 'single'),
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
            decryptByLocalKey: (a, b, c) => decryptByBobLocalKey(b, c),
            hasLocalKeyOf: async () => true,
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
            deriveAESKey: deriveAESKey('jack', 'array'),
            async *queryPostKey_version38() {
                for (const [, each] of encrypted.e2e!) {
                    if (each.status === 'rejected') continue
                    if (!each.value.ivToBePublished) throw new Error('ivToBePublished is missing!')
                    yield { encryptedPostKey: each.value.encryptedPostKey, postKeyIV: each.value.ivToBePublished }
                }
            },
        }
        for await (const progress of decrypt({ message: parsed }, decryptIO)) {
            result.push(progress)
        }
        expect(result).toMatchSnapshot('decrypted as jack')
    }

    // append another receiver
    const appendResult = await appendEncryptionTarget(
        {
            iv: encrypted.identifier.toIV(),
            postAESKey: encrypted.postKey,
            target: [ProfileIdentifier.of('localhost', 'joey').unwrap()],
            version: -38,
        },
        {
            getRandomValues: getRandomValues(),
            getRandomECKey: getTestRandomECKey(),
            queryPublicKey: queryTestPublicKey,
            deriveAESKey: deriveAESKey('bob', 'single'),
        },
    )
    expect(appendResult).toMatchSnapshot('append target to joey')

    // decrypt as joey
    {
        const result: any[] = []
        const decryptIO: DecryptIO = {
            ...minimalDecryptIO,
            deriveAESKey: deriveAESKey('joey', 'array'),
            async *queryPostKey_version38() {
                for (const [, each] of appendResult) {
                    if (each.status === 'rejected') continue
                    if (!each.value.ivToBePublished) throw new Error('ivToBePublished is missing!')
                    yield { encryptedPostKey: each.value.encryptedPostKey, postKeyIV: each.value.ivToBePublished }
                }
            },
        }
        for await (const progress of decrypt({ message: parsed }, decryptIO)) {
            result.push(progress)
        }
        expect(result).toMatchSnapshot('decrypted as joey')
    }
})

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
    deriveAESKey: reject,
    encryptByLocalKey: reject,

    getRandomECKey: reject,
    getRandomValues: mockIV,
    getRandomAESKey: returnTestKey,
}
const minimalDecryptIO: DecryptIO = {
    decryptByLocalKey: reject,
    deriveAESKey: reject,
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
    return (await importAESFromJWK(testKey)).unwrap()
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
