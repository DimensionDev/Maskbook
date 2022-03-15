import { encodeArrayBuffer, unreachable } from '@dimensiondev/kit'
import { AESCryptoKey, PostIVIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import { isTypedMessageText, encodeTypedMessageV38Format, encodeTypedMessageToDocument } from '@masknet/typed-message'
import { None, Option, Some } from 'ts-results'
import {
    AESAlgorithmEnum,
    AsymmetryCryptoKey,
    encodePayload,
    PayloadWellFormed,
    PublicKeyAlgorithmEnum,
} from '../payload'
import { encryptWithAES } from '../utils'

import { EncryptError, EncryptErrorReasons, EncryptIO, EncryptOptions, EncryptResult } from './EncryptionTypes'

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
    let message: Uint8Array

    if (options.version === -38) {
        if (!isTypedMessageText(options.message)) {
            throw new EncryptError(EncryptErrorReasons.ComplexTypedMessageNotSupportedInPayload38)
        }
        message = encodeTypedMessageV38Format(options.message)
    } else {
        message = encodeTypedMessageToDocument(options.message)
    }

    const iv = getIV(io)
    const authorPublic = queryAuthorPublicKey(options.author, io)

    const postKey = await aes256GCM(io)
    const encrypted = (await encryptWithAES(AESAlgorithmEnum.A256GCM, postKey, iv, message)).unwrap()

    const encryption: PayloadWellFormed.PublicEncryption = {
        iv,
        type: 'public',
        AESKey: { algr: AESAlgorithmEnum.A256GCM, key: postKey },
    }
    const payload: PayloadWellFormed.Payload = {
        version: options.version,
        author: options.author.isUnknown ? None : Some(options.author),
        authorPublicKey: await authorPublic,
        encryption,
        encrypted,
        signature: None,
    }
    return {
        postKey,
        identifier: new PostIVIdentifier(options.author.network, encodeArrayBuffer(iv)),
        output: (await encodePayload.NoSign(payload)).unwrap(),
        author: options.author,
    }
}
async function v38EncryptionE2E(options: EncryptOptions, io: EncryptIO): Promise<EncryptResult> {
    throw new Error('Not implemented')
}
async function v37EncryptionE2E(options: EncryptOptions, io: EncryptIO): Promise<EncryptResult> {
    throw new Error('Not implemented')
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
