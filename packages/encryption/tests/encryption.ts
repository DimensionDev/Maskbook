import { test, expect } from 'vitest'
import {
    appendEncryptionTarget,
    decrypt,
    DecryptIntermediateProgressKind,
    type DecryptIO,
    DecryptProgressKind,
    encrypt,
    type EncryptIO,
    type EncryptOptions,
    parsePayload,
    importAESFromJWK,
} from '../src/index.js'
import { ProfileIdentifier, type AESCryptoKey } from '@masknet/base'
import { makeTypedMessageText, makeTypedMessageTupleSerializable } from '@masknet/typed-message'
import {
    deriveAESKey,
    encryptDecryptWith,
    getBobLocalKey,
    getRandomValues,
    getTestRandomAESKey,
    getTestRandomECKey,
    queryTestPublicKey,
} from './keys.js'
import { exportCryptoKeyToJWK } from '../src/utils/crypto.js'
import { None } from 'ts-results-es'

const publicTarget: EncryptOptions['target'] = {
    type: 'public',
}
const alice = ProfileIdentifier.of('localhost', 'alice')
const example: EncryptOptions = {
    version: -38,
    author: alice,
    authorPublicKey: await queryTestPublicKey(alice.unwrap()),
    message: makeTypedMessageText('hello world'),
    target: publicTarget,
    network: 'localhost',
}
function createSetPostKeyCache() {
    const { promise: setPostKeyCacheSuccess, resolve, reject } = Promise.withResolvers()
    return {
        async setPostKeyCache(key: AESCryptoKey) {
            // the key must can be extracted
            exportCryptoKeyToJWK(key)
                .then((x) => x.unwrap())
                .then(resolve, reject)
        },
        setPostKeyCacheSuccess,
    }
}
test('v37 public encryption', async () => {
    await testSet('minimal v37', { ...example, authorPublicKey: None, version: -37 })

    await testSet(
        'full v37',
        {
            version: -37,
            target: publicTarget,
            message: complexMessage(),
            author: example.author,
            authorPublicKey: example.authorPublicKey,
            network: 'localhost',
        },
        minimalEncryptIO,
        {
            ...minimalDecryptIO,
            setPostKeyCache: returnVoid,
        },
    )
})

test('v38 public encryption', async () => {
    await testSet('minimal v38', { ...example, authorPublicKey: None })

    await testSet(
        'full v38',
        {
            version: -38,
            target: publicTarget,
            message: makeTypedMessageText('hello world'),
            author: example.author,
            authorPublicKey: example.authorPublicKey,
            network: 'localhost',
        },
        minimalEncryptIO,
        {
            ...minimalDecryptIO,
            setPostKeyCache: returnVoid,
        },
    )
})

test('v37 E2E encryption', async () => {
    const bob = ProfileIdentifier.of('localhost', 'bob')
    const payload: EncryptOptions = {
        network: 'localhost',
        author: bob,
        authorPublicKey: await queryTestPublicKey(bob.unwrap()),
        message: makeTypedMessageText('hello world'),
        target: {
            type: 'E2E',
            target: [(await queryTestPublicKey(ProfileIdentifier.of('localhost', 'jack').unwrap())).unwrap()],
        },
        version: -37,
    }

    const encrypted = await encrypt(payload, {
        encryptByLocalKey: reject,
        deriveAESKey: reject,
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
        const { setPostKeyCache, setPostKeyCacheSuccess } = createSetPostKeyCache()
        const decryptIO: DecryptIO = {
            ...minimalDecryptIO,
            setPostKeyCache,
            deriveAESKey: deriveAESKey('bob', 'array'),
        }
        for await (const progress of decrypt({ message: parsed }, decryptIO)) {
            result.push(progress)
        }
        expect(result).toMatchSnapshot('decrypted as author')
        await setPostKeyCacheSuccess
    }

    // decrypt as jack
    {
        const result: any[] = []
        const { setPostKeyCache, setPostKeyCacheSuccess } = createSetPostKeyCache()
        const decryptIO: DecryptIO = {
            ...minimalDecryptIO,
            setPostKeyCache,
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
        await setPostKeyCacheSuccess
    }

    // append another receiver
    const appendResult = await appendEncryptionTarget(
        {
            iv: encrypted.identifier.toIV(),
            postAESKey: encrypted.postKey,
            target: [(await queryTestPublicKey(ProfileIdentifier.of('localhost', 'joey').unwrap())).unwrap()],
            version: -37,
        },
        {
            getRandomValues: getRandomValues(),
            getRandomECKey: getTestRandomECKey(),
            deriveAESKey: reject,
        },
    )
    expect(appendResult).toMatchSnapshot('append target to joey')

    // decrypt as joey
    {
        const result: any[] = []
        const { setPostKeyCache, setPostKeyCacheSuccess } = createSetPostKeyCache()
        const decryptIO: DecryptIO = {
            ...minimalDecryptIO,
            setPostKeyCache,
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
        await setPostKeyCacheSuccess
    }
})
test('v38 E2E encryption', async () => {
    const bob = ProfileIdentifier.of('localhost', 'bob')
    const payload: EncryptOptions = {
        network: 'localhost',
        author: bob,
        authorPublicKey: await queryTestPublicKey(bob.unwrap()),
        message: makeTypedMessageText('hello world'),
        target: {
            type: 'E2E',
            target: [(await queryTestPublicKey(ProfileIdentifier.of('localhost', 'jack').unwrap())).unwrap()],
        },
        version: -38,
    }

    const { decrypt: decryptByBobLocalKey, encrypt: encryptByBobLocalKey } = encryptDecryptWith(getBobLocalKey)
    const encrypted = await encrypt(payload, {
        encryptByLocalKey: encryptByBobLocalKey,
        deriveAESKey: deriveAESKey('bob', 'single'),
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
        const { setPostKeyCache, setPostKeyCacheSuccess } = createSetPostKeyCache()
        const decryptIO: DecryptIO = {
            ...minimalDecryptIO,
            setPostKeyCache,
            decryptByLocalKey: (a, b, c) => decryptByBobLocalKey(b, c),
            hasLocalKeyOf: async () => true,
        }
        for await (const progress of decrypt({ message: parsed }, decryptIO)) {
            result.push(progress)
        }
        expect(result).toMatchSnapshot('decrypted as author')
        await setPostKeyCacheSuccess
    }

    // decrypt as jack
    {
        const result: any[] = []
        const { setPostKeyCache, setPostKeyCacheSuccess } = createSetPostKeyCache()
        const decryptIO: DecryptIO = {
            ...minimalDecryptIO,
            setPostKeyCache,
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
        await setPostKeyCacheSuccess
    }

    // append another receiver
    const appendResult = await appendEncryptionTarget(
        {
            iv: encrypted.identifier.toIV(),
            postAESKey: encrypted.postKey,
            target: [(await queryTestPublicKey(ProfileIdentifier.of('localhost', 'joey').unwrap())).unwrap()],
            version: -38,
        },
        {
            getRandomValues: getRandomValues(),
            getRandomECKey: getTestRandomECKey(),
            deriveAESKey: deriveAESKey('bob', 'single'),
        },
    )
    expect(appendResult).toMatchSnapshot('append target to joey')

    // decrypt as joey
    {
        const result: any[] = []
        const { setPostKeyCache, setPostKeyCacheSuccess } = createSetPostKeyCache()
        const decryptIO: DecryptIO = {
            ...minimalDecryptIO,
            setPostKeyCache,
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
        await setPostKeyCacheSuccess
    }
})

async function testSet(
    key: string,
    options: EncryptOptions,
    io = minimalEncryptIO,
    decryptIO: DecryptIO = minimalDecryptIO as any,
    waitE2E = false,
) {
    const a = await encrypt(options, io)
    expect(a).toMatchSnapshot(key)

    const a1 = (await parsePayload(a.output)).unwrap()
    expect(a1).toMatchSnapshot(key + ' parsed')

    const result: any[] = []
    const { setPostKeyCache, setPostKeyCacheSuccess } = createSetPostKeyCache()
    if (decryptIO === minimalDecryptIO) decryptIO = { ...decryptIO, setPostKeyCache }
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
    if (decryptIO === minimalDecryptIO) await setPostKeyCacheSuccess
}

const minimalEncryptIO: EncryptIO = {
    deriveAESKey: reject,
    encryptByLocalKey: reject,

    getRandomECKey: reject,
    getRandomValues: mockIV,
    getRandomAESKey: returnTestKey,
}
const minimalDecryptIO: Omit<DecryptIO, 'setPostKeyCache'> = {
    decryptByLocalKey: reject,
    deriveAESKey: reject,
    getPostKeyCache: returnNull,
    hasLocalKeyOf: returnFalse,
    queryAuthorPublicKey: returnNull,
    queryPostKey_version37: rejectGenerator,
    queryPostKey_version38: rejectGenerator,
    queryPostKey_version39: rejectGenerator,
    queryPostKey_version40: reject,
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
