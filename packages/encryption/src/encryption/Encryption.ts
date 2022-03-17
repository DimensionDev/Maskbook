import { encodeArrayBuffer, unreachable } from '@dimensiondev/kit'
import {
    AESCryptoKey,
    EC_Private_CryptoKey,
    EC_Public_CryptoKey,
    IdentifierMap,
    PostIVIdentifier,
    ProfileIdentifier,
} from '@masknet/shared-base'
import {
    isTypedMessageText,
    encodeTypedMessageV38Format,
    encodeTypedMessageToDocument,
    SerializableTypedMessages,
} from '@masknet/typed-message'
import { None, Option, Some } from 'ts-results'
import { AESAlgorithmEnum, EC_Key, encodePayload, PayloadWellFormed, EC_KeyCurveEnum } from '../payload'
import { encryptWithAES } from '../utils'

import {
    EncryptError,
    EncryptErrorReasons,
    EncryptIO,
    EncryptionResultE2E,
    EncryptOptions,
    EncryptResult,
} from './EncryptionTypes'

export * from './EncryptionTypes'
export async function encrypt(options: EncryptOptions, io: EncryptIO): Promise<EncryptResult> {
    if (options.target.type === 'public') return encryptionPublic(options, io)
    if (options.version === -38) {
        return v38EncryptionE2E(options, io)
    } else if (options.version === -37) {
        return v37EncryptionE2E(options, io)
    }
    unreachable(options.version)
}

async function encryptionPublic(options: EncryptOptions, io: EncryptIO): Promise<EncryptResult> {
    const iv = getIV(io)
    const postKey = await aes256GCM(io)
    const authorPublic = queryAuthorPublicKey(options.author, io)

    const encodedMessage = encodeMessage(options.version, options.message)
    const encryptedMessage = encodedMessage
        .then((message) => encryptWithAES(AESAlgorithmEnum.A256GCM, postKey, iv, message))
        .then((x) => x.unwrap())

    const encryption: PayloadWellFormed.PublicEncryption = {
        iv,
        type: 'public',
        AESKey: { algr: AESAlgorithmEnum.A256GCM, key: postKey },
    }
    const payload = encodePayload
        .NoSign({
            version: options.version,
            author: options.author.isUnknown ? None : Some(options.author),
            authorPublicKey: await authorPublic,
            encryption,
            encrypted: await encryptedMessage,
            signature: None,
        })
        .then((x) => x.unwrap())
    return {
        author: options.author,
        identifier: new PostIVIdentifier(options.author.network, encodeArrayBuffer(iv)),
        postKey,
        output: await payload,
    }
}

async function v38EncryptionE2E(options: EncryptOptions, io: EncryptIO): Promise<EncryptResult> {
    if (options.target.type === 'public') throw new Error('unreachable')

    const iv = getIV(io)
    const postKey = await aes256GCM(io)
    const authorPublic = queryAuthorPublicKey(options.author, io)

    const encodedMessage = encodeMessage(options.version, options.message)
    const encryptedMessage = encodedMessage
        .then((message) => encryptWithAES(AESAlgorithmEnum.A256GCM, postKey, iv, message))
        .then((x) => x.unwrap())
    const postKeyEncoded = crypto.subtle
        .exportKey('jwk', postKey)
        .then(JSON.stringify)
        .then((x) => new TextEncoder().encode(x))

    // For every receiver R,
    //     1. Let R_pub = R.publicKey
    //     2. Let Internal_AES be the result of ECDH with the sender's private key and R_pub
    //     Note: To keep compatibility, here we use the algorithm in
    //     https://github.com/DimensionDev/Maskbook/blob/f3d83713d60dd0aad462e0648c4d38586c106edc/packages/mask/src/crypto/crypto-alpha-40.ts#L29-L58
    //     3. Let ivToBePublish be a new generated IV. This should be sent to the receiver.
    //     4. Calculate new AES key and IV based on Internal_AES and ivToBePublish.
    //     Note: Internal_AES is not returned by io.deriveAESKey_version38_or_older, it is internal algorithm of that method.
    const ecdh = Promise.allSettled(
        options.target.target.map(async (id): Promise<EncryptionResultE2E> => {
            const receiverPublicKey = id.isUnknown ? undefined : await io.queryPublicKey(id)
            if (!receiverPublicKey) throw new EncryptError(EncryptErrorReasons.PublicKeyNotFound)
            const { aes, iv, ivToBePublished } = await io.deriveAESKey_version38_or_older(receiverPublicKey.key)
            const encryptedPostKey = await encryptWithAES(AESAlgorithmEnum.A256GCM, aes, iv, await postKeyEncoded)
            return {
                ivToBePublished,
                encryptedPostKey: encryptedPostKey.unwrap(),
                target: id,
            }
        }),
    ).then((x) => x.entries())

    const encryption: PayloadWellFormed.EndToEndEncryption = {
        type: 'E2E',
        // v38 does not support ephemeral encryption.
        ephemeralPublicKey: new Map(),
        iv,
        ownersAESKeyEncrypted: await io.encryptByLocalKey(await postKeyEncoded, iv),
    }

    const payload = encodePayload
        .NoSign({
            version: -38,
            author: options.author.isUnknown ? None : Some(options.author),
            authorPublicKey: await authorPublic,
            encryption,
            encrypted: await encryptedMessage,
            signature: None,
        })
        .then((x) => x.unwrap())

    const ecdhResult: EncryptResult['e2e'] = new IdentifierMap(new Map(), ProfileIdentifier)
    for (const [index, result] of await ecdh) {
        ecdhResult.set(options.target.target[index], result)
    }

    return {
        author: options.author,
        identifier: new PostIVIdentifier(options.author.network, encodeArrayBuffer(iv)),
        output: await payload,
        postKey: postKey,
        e2e: ecdhResult,
    }
}
async function v37EncryptionE2E(options: EncryptOptions, io: EncryptIO): Promise<EncryptResult> {
    if (options.target.type === 'public') throw new Error('unreachable')

    const iv = getIV(io)
    const postKey = await aes256GCM(io)
    const encodedMessage = encodeMessage(options.version, options.message)
    const encryptedMessage = encodedMessage
        .then((message) => encryptWithAES(AESAlgorithmEnum.A256GCM, postKey, iv, message))
        .then((x) => x.unwrap())
    const postKeyEncoded = crypto.subtle.exportKey('raw', postKey).then((x) => new Uint8Array(x))

    const authorPublic = await queryAuthorPublicKey(options.author, io)
    if (!authorPublic.some) throw new EncryptError(EncryptErrorReasons.PublicKeyNotFound)

    const ephemeralKeys = new Map<
        EC_KeyCurveEnum,
        | Promise<readonly [EC_Public_CryptoKey, EC_Private_CryptoKey]>
        | readonly [EC_Public_CryptoKey, EC_Private_CryptoKey]
    >()
    // get ephemeral keys, generate one if not found
    const getEphemeralKey = async (curve: EC_KeyCurveEnum) => {
        if (ephemeralKeys.has(curve)) return ephemeralKeys.get(curve)!
        ephemeralKeys.set(curve, ec(io, curve))
        return ephemeralKeys.get(curve)!
    }

    const ecdh = Promise.allSettled(
        options.target.target.map(async (id): Promise<EncryptionResultE2E> => {
            const receiverPublicKey = id.isUnknown ? undefined : await io.queryPublicKey(id)
            if (!receiverPublicKey) throw new EncryptError(EncryptErrorReasons.PublicKeyNotFound)
            const [, ephemeralPrivateKey] = await getEphemeralKey(receiverPublicKey.algr)
            const aes = await crypto.subtle.deriveKey(
                { name: 'ECDH', public: receiverPublicKey.key },
                ephemeralPrivateKey,
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt'],
            )
            // Note: we're reusing iv in the post encryption.
            const encryptedPostKey = await encryptWithAES(AESAlgorithmEnum.A256GCM, aes, iv, await postKeyEncoded)
            return {
                encryptedPostKey: encryptedPostKey.unwrap(),
                target: id,
                // we don't need to provide `ephemeralPublicKey` field,
                // because this is the first time encryption, the ephemeralPublicKey will be included in the payload.
            }
        }),
    ).then((x) => x.entries())

    const ownersAESKeyEncrypted = Promise.resolve().then(async () => {
        const authorPublicKey = authorPublic.val
        const [, ephemeralPrivateKey] = await getEphemeralKey(authorPublicKey.algr)

        // we get rid of localKey in v38
        const aes = await crypto.subtle.deriveKey(
            { name: 'ECDH', public: authorPublicKey.key },
            ephemeralPrivateKey,
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt'],
        )
        // Note: we're reusing iv in the post encryption.
        const encryptedPostKey = await encryptWithAES(AESAlgorithmEnum.A256GCM, aes, iv, await postKeyEncoded)
        return encryptedPostKey.unwrap()
    })

    const encryption: PayloadWellFormed.EndToEndEncryption = {
        type: 'E2E',
        ephemeralPublicKey: new Map(),
        iv,
        ownersAESKeyEncrypted: await ownersAESKeyEncrypted,
    }

    // we must ensure ecdh is all resolved, otherwise we may miss some result of ephemeralPublicKey.
    const ecdhResult: EncryptResult['e2e'] = new IdentifierMap(new Map(), ProfileIdentifier)
    for (const [index, result] of await ecdh) {
        ecdhResult.set(options.target.target[index], result)
    }
    for (const [curve, keys] of ephemeralKeys) {
        encryption.ephemeralPublicKey.set(curve, (await keys)[0])
    }

    const payload = await encodePayload.NoSign({
        version: -37,
        author: options.author.isUnknown ? None : Some(options.author),
        authorPublicKey: authorPublic,
        encryption,
        encrypted: await encryptedMessage,
        signature: None,
    })

    return {
        author: options.author,
        identifier: new PostIVIdentifier(options.author.network, encodeArrayBuffer(iv)),
        output: payload.unwrap(),
        postKey: postKey,
        e2e: ecdhResult,
    }
}

async function encodeMessage(version: -38 | -37, message: SerializableTypedMessages) {
    if (version === -37) return encodeTypedMessageToDocument(message)
    if (!isTypedMessageText(message))
        throw new EncryptError(EncryptErrorReasons.ComplexTypedMessageNotSupportedInPayload38)
    return encodeTypedMessageV38Format(message)
}
async function queryAuthorPublicKey(of: ProfileIdentifier, io: EncryptIO): Promise<Option<EC_Key>> {
    try {
        if (of.isUnknown) return None
        const key = await io.queryPublicKey(of)
        if (!key) return None
        return Some(key)
    } catch (error) {
        console.warn('[@masknet/encryption] Failed when query author public key', error)
        return None
    }
}
function getIV(io: EncryptIO): Uint8Array {
    if (io.getRandomValues) return io.getRandomValues(new Uint8Array(16))
    return crypto.getRandomValues(new Uint8Array(16))
}
async function aes256GCM(io: EncryptIO): Promise<AESCryptoKey> {
    if (io.getRandomAESKey) return io.getRandomAESKey()
    return (await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
        'encrypt',
        'decrypt',
    ])) as AESCryptoKey
}

async function ec(io: EncryptIO, kind: EC_KeyCurveEnum) {
    if (io.getRandomECKey) return io.getRandomECKey(kind)
    const namedCurve: Record<EC_KeyCurveEnum, string> = {
        [EC_KeyCurveEnum.secp256p1]: 'P-256',
        [EC_KeyCurveEnum.secp256k1]: 'K-256',
        get [EC_KeyCurveEnum.ed25519](): string {
            throw new Error('TODO: support ED25519')
        },
    }
    const { privateKey, publicKey } = await crypto.subtle.generateKey(
        { name: 'ECDH', namedCurve: namedCurve[kind] },
        true,
        ['deriveKey'],
    )
    return [publicKey as EC_Public_CryptoKey, privateKey as EC_Private_CryptoKey] as const
}
