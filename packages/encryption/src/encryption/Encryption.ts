import { encodeArrayBuffer, unreachable } from '@masknet/kit'
import { type AESCryptoKey, type EC_Public_CryptoKey, PostIVIdentifier } from '@masknet/base'
import {
    isTypedMessageText,
    encodeTypedMessageToDeprecatedFormat,
    encodeTypedMessageToDocument,
    type SerializableTypedMessages,
} from '@masknet/typed-message'
import { None, type Option } from 'ts-results-es'
import { type EC_Key, encodePayload, type PayloadWellFormed } from '../payload/index.js'
import { encryptWithAES } from '../utils/index.js'

import {
    EncryptErrorReasons,
    type EncryptIO,
    type EncryptOptions,
    type EncryptResult,
    type EncryptTargetE2E,
} from './EncryptionTypes.js'
import { createEphemeralKeysMap, fillIV } from './utils.js'
import { v37_addReceiver } from './v37-ecdh.js'
import { v38_addReceiver } from './v38-ecdh.js'

export * from './EncryptionTypes.js'
export async function encrypt(options: EncryptOptions, io: EncryptIO): Promise<EncryptResult> {
    const postIV = fillIV(io)
    const postKey = await aes256GCM(io)
    if (!postKey.usages.includes('encrypt') || !postKey.usages.includes('decrypt') || !postKey.extractable) {
        throw new Error(EncryptErrorReasons.AESKeyUsageError)
    }

    const encodedMessage = encodeMessage(options.version, options.message)
    const encryptedMessage = encodedMessage
        .then((message) => encryptWithAES(postKey, postIV, message))
        .then((x) => x.unwrap())

    let encryption: PayloadWellFormed.PublicEncryption | PayloadWellFormed.EndToEndEncryption
    let ecdhResult: EncryptResult['e2e']

    if (options.target.type === 'public') {
        encryption = {
            iv: postIV,
            type: 'public',
            AESKey: postKey,
        }
    } else {
        const postKeyEncoded = encodePostKey(options.version, postKey)
        const context: Context = { authorPublic: options.authorPublicKey, postKeyEncoded, postIV }

        if (options.version === -38) [encryption, ecdhResult] = await e2e_v38(context, options.target, io)
        else if (options.version === -37) [encryption, ecdhResult] = await e2e_v37(context, options.target, io)
        else unreachable(options.version)
    }

    const payload = encodePayload
        .NoSign({
            version: options.version,
            author: options.author,
            authorPublicKey: options.authorPublicKey ?? None,
            encryption,
            encrypted: await encryptedMessage,
            signature: None,
        })
        .then((x) => x.unwrap())

    return {
        author: options.author.unwrapOr(undefined),
        identifier: new PostIVIdentifier(options.network, encodeArrayBuffer(postIV)),
        postKey,
        output: await payload,
        e2e: ecdhResult,
    }
}
type Context = {
    postIV: Uint8Array
    postKeyEncoded: Promise<Uint8Array>
    authorPublic?: Option<EC_Key<EC_Public_CryptoKey>>
}

/** @internal */
export async function encodePostKey(version: EncryptOptions['version'], key: CryptoKey) {
    if (version === -37) return crypto.subtle.exportKey('raw', key).then((x) => new Uint8Array(x))
    else if (version === -38)
        return crypto.subtle
            .exportKey('jwk', key)
            .then(JSON.stringify)
            .then((x) => new TextEncoder().encode(x))
    unreachable(version)
}
async function e2e_v37(
    context: Context,
    target: EncryptTargetE2E,
    io: EncryptIO,
): Promise<[PayloadWellFormed.EndToEndEncryption, EncryptResult['e2e']]> {
    const { authorPublic, postIV, postKeyEncoded } = context
    if (!authorPublic?.isSome()) throw new Error(EncryptErrorReasons.PublicKeyNotFound)

    const { ephemeralKeys, getEphemeralKey } = createEphemeralKeysMap(io)
    const ecdhResult = v37_addReceiver(true, { ...context, getEphemeralKey }, target, io)

    const ownersAESKeyEncrypted = Promise.resolve().then(async () => {
        const [, ephemeralPrivateKey] = await getEphemeralKey(authorPublic.value.algr)

        // we get rid of localKey in v38
        const aes = await crypto.subtle.deriveKey(
            { name: 'ECDH', public: authorPublic.value.key },
            ephemeralPrivateKey,
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt'],
        )
        // Note: we're reusing iv in the post encryption.
        const encryptedPostKey = await encryptWithAES(aes, postIV, await postKeyEncoded)
        return encryptedPostKey.unwrap()
    })

    const encryption: PayloadWellFormed.EndToEndEncryption = {
        type: 'E2E',
        ephemeralPublicKey: new Map(),
        iv: postIV,
        ownersAESKeyEncrypted: await ownersAESKeyEncrypted,
    }

    // wait ecdh to finish write ephemeralKeys
    await ecdhResult
    for (const [curve, keys] of ephemeralKeys) {
        encryption.ephemeralPublicKey.set(curve, (await keys)[0])
    }
    return [encryption, await ecdhResult]
}
async function e2e_v38(
    context: Context,
    target: EncryptTargetE2E,
    io: EncryptIO,
): Promise<[PayloadWellFormed.EndToEndEncryption, EncryptResult['e2e']]> {
    const { postIV, postKeyEncoded } = context
    const ecdhResult = await v38_addReceiver(postKeyEncoded, target, io)
    const encryption: PayloadWellFormed.EndToEndEncryption = {
        type: 'E2E',
        // v38 does not support ephemeral encryption.
        ephemeralPublicKey: new Map(),
        iv: postIV,
        ownersAESKeyEncrypted: new Uint8Array(await io.encryptByLocalKey(await postKeyEncoded, postIV)),
    }
    return [encryption, ecdhResult]
}

async function encodeMessage(version: -38 | -37, message: SerializableTypedMessages) {
    if (version === -37) return encodeTypedMessageToDocument(message)
    if (!isTypedMessageText(message)) throw new Error(EncryptErrorReasons.ComplexTypedMessageNotSupportedInPayload38)
    return encodeTypedMessageToDeprecatedFormat(message)
}
async function aes256GCM(io: EncryptIO): Promise<AESCryptoKey> {
    if (io.getRandomAESKey) return io.getRandomAESKey()
    return (await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
        'encrypt',
        'decrypt',
    ])) as AESCryptoKey
}
