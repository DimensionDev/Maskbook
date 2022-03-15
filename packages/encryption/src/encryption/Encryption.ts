import { encodeArrayBuffer, unreachable } from '@dimensiondev/kit'
import { AESCryptoKey, IdentifierMap, PostIVIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import {
    isTypedMessageText,
    encodeTypedMessageV38Format,
    encodeTypedMessageToDocument,
    SerializableTypedMessages,
} from '@masknet/typed-message'
import { None, Option, Some } from 'ts-results'
import {
    AESAlgorithmEnum,
    AsymmetryCryptoKey,
    encodePayload,
    PayloadWellFormed,
    PublicKeyAlgorithmEnum,
} from '../payload'
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
            const pub = await io.queryPublicKey(id)
            if (!pub) throw new EncryptError(EncryptErrorReasons.TargetPublicKeyNotFound)
            const { aes, iv, ivToBePublished } = await io.deriveAESKey_version38_or_older(pub)
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
    throw new Error('Not implemented')
}

async function encodeMessage(version: -38 | -37, message: SerializableTypedMessages) {
    if (version === -37) return encodeTypedMessageToDocument(message)
    if (!isTypedMessageText(message))
        throw new EncryptError(EncryptErrorReasons.ComplexTypedMessageNotSupportedInPayload38)
    return encodeTypedMessageV38Format(message)
}
async function queryAuthorPublicKey(of: ProfileIdentifier, io: EncryptIO): Promise<Option<AsymmetryCryptoKey>> {
    try {
        const key = await io.queryPublicKey(of)
        if (!key) return None
        const k: AsymmetryCryptoKey = {
            algr: PublicKeyAlgorithmEnum.secp256k1,
            key,
        }
        return Some(k)
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
