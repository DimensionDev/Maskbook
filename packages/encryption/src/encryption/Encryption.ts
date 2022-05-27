import { encodeArrayBuffer, unreachable } from '@dimensiondev/kit'
import { AESCryptoKey, EC_Public_CryptoKey, PostIVIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import {
    isTypedMessageText,
    encodeTypedMessageV38Format,
    encodeTypedMessageToDocument,
    SerializableTypedMessages,
} from '@masknet/typed-message'
import { None, Option, Some } from 'ts-results'
import { EC_Key, encodePayload, PayloadWellFormed } from '../payload'
import { encryptWithAES } from '../utils'

import {
    EncryptError,
    EncryptErrorReasons,
    EncryptIO,
    EncryptOptions,
    EncryptResult,
    EncryptTargetE2E,
} from './EncryptionTypes'
import { createEphemeralKeysMap, fillIV } from './utils'
import { v37_addReceiver } from './v37-ecdh'
import { v38_addReceiver } from './v38-ecdh'

export * from './EncryptionTypes'
export async function encrypt(options: EncryptOptions, io: EncryptIO): Promise<EncryptResult> {
    const postIV = fillIV(io)
    const postKey = await aes256GCM(io)
    if (!postKey.usages.includes('encrypt') || !postKey.usages.includes('decrypt') || !postKey.extractable) {
        throw new EncryptError(EncryptErrorReasons.AESKeyUsageError)
    }
    const authorPublic = queryAuthorPublicKey(options.author || null, io)

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
        const context: Context = { authorPublic, postKeyEncoded, postIV }

        if (options.version === -38) [encryption, ecdhResult] = await e2e_v38(context, options.target, io)
        else if (options.version === -37) [encryption, ecdhResult] = await e2e_v37(context, options.target, io)
        else unreachable(options.version)
    }

    const payload = encodePayload
        .NoSign({
            version: options.version,
            author: options.author ? Some(options.author) : None,
            authorPublicKey: await authorPublic,
            encryption,
            encrypted: await encryptedMessage,
            signature: None,
        })
        .then((x) => x.unwrap())

    return {
        author: options.author,
        identifier: new PostIVIdentifier(options.network, encodeArrayBuffer(postIV)),
        postKey,
        output: await payload,
        e2e: ecdhResult,
    }
}
type Context = {
    postIV: Uint8Array
    postKeyEncoded: Promise<Uint8Array>
    authorPublic: Promise<Option<EC_Key<EC_Public_CryptoKey>>>
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
    const authorPublicKey = await authorPublic
    if (!authorPublicKey.some) throw new EncryptError(EncryptErrorReasons.PublicKeyNotFound)

    const { ephemeralKeys, getEphemeralKey } = createEphemeralKeysMap(io)
    const ecdhResult = v37_addReceiver(true, { ...context, getEphemeralKey }, target, io)

    const ownersAESKeyEncrypted = Promise.resolve().then(async () => {
        const [, ephemeralPrivateKey] = await getEphemeralKey(authorPublicKey.val.algr)

        // we get rid of localKey in v38
        const aes = await crypto.subtle.deriveKey(
            { name: 'ECDH', public: authorPublicKey.val.key },
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
        ownersAESKeyEncrypted: await io.encryptByLocalKey(await postKeyEncoded, postIV),
    }
    return [encryption, ecdhResult]
}

async function encodeMessage(version: -38 | -37, message: SerializableTypedMessages) {
    if (version === -37) return encodeTypedMessageToDocument(message)
    if (!isTypedMessageText(message))
        throw new EncryptError(EncryptErrorReasons.ComplexTypedMessageNotSupportedInPayload38)
    return encodeTypedMessageV38Format(message)
}
async function queryAuthorPublicKey(
    of: ProfileIdentifier | null,
    io: EncryptIO,
): Promise<Option<EC_Key<EC_Public_CryptoKey>>> {
    try {
        if (!of) return None
        const key = await io.queryPublicKey(of)
        if (!key) return None
        return Some(key)
    } catch (error) {
        console.warn('[@masknet/encryption] Failed when query author public key', error)
        return None
    }
}
async function aes256GCM(io: EncryptIO): Promise<AESCryptoKey> {
    if (io.getRandomAESKey) return io.getRandomAESKey()
    return (await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
        'encrypt',
        'decrypt',
    ])) as AESCryptoKey
}
