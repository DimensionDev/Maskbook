import { AESCryptoKey, CheckedError } from '@masknet/shared-base'
import { Result, Ok } from 'ts-results'
import { AESAlgorithmEnum, PublicKeyAlgorithmEnum } from '../payload'
import { CryptoException } from '../types'

export function importAESFromJWK(key: JsonWebKey, kind: AESAlgorithmEnum): Promise<Result<AESCryptoKey, unknown>> {
    return Result.wrapAsync(() => {
        const param: Record<AESAlgorithmEnum, AesKeyAlgorithm> = {
            [AESAlgorithmEnum.A256GCM]: {
                name: 'AES-GCM',
                length: 256,
            },
        }
        return crypto.subtle.importKey('jwk', key, param[kind], true, ['encrypt', 'decrypt']) as any
    })
}
importAESFromJWK.AES_GCM_256 = (key: JsonWebKey) => importAESFromJWK(key, AESAlgorithmEnum.A256GCM)

export function exportCryptoKeyToJWK(key: CryptoKey) {
    return Result.wrapAsync(() => crypto.subtle.exportKey('jwk', key))
}
export function exportCryptoKeyToSPKI(key: CryptoKey) {
    return Result.wrapAsync(() => crypto.subtle.exportKey('spki', key).then((x) => new Uint8Array(x)))
}
export function exportCryptoKeyToRaw(key: CryptoKey) {
    return Result.wrapAsync(() => crypto.subtle.exportKey('raw', key).then((x) => new Uint8Array(x)))
}

export function importAsymmetryKeyFromJsonWebKeyOrSPKI(key: JsonWebKey | Uint8Array, kind: PublicKeyAlgorithmEnum) {
    const DeriveKeyUsage: KeyUsage[] = ['deriveKey', 'deriveBits']
    const ImportParamsMap = {
        [PublicKeyAlgorithmEnum.secp256k1]: { name: 'ECDH', namedCurve: 'K-256' } as EcKeyImportParams,
        [PublicKeyAlgorithmEnum.secp256p1]: { name: 'ECDH', namedCurve: 'P-256' } as EcKeyImportParams,
    } as const
    return Result.wrapAsync(async () => {
        if (kind === PublicKeyAlgorithmEnum.ed25519) {
            throw new CheckedError(CryptoException.UnsupportedAlgorithm, 'TODO: support ED25519')
        }
        if (key instanceof Uint8Array) {
            return crypto.subtle.importKey('spki', key, ImportParamsMap[kind], true, DeriveKeyUsage)
        } else {
            return crypto.subtle.importKey('jwk', key, ImportParamsMap[kind], true, DeriveKeyUsage)
        }
    })
}

export function encryptWithAES(kind: AESAlgorithmEnum, key: CryptoKey, iv: Uint8Array, message: Uint8Array) {
    const param = {
        [AESAlgorithmEnum.A256GCM]: { name: 'AES-GCM', iv } as AesGcmParams,
    } as const
    return Result.wrapAsync(() => {
        return crypto.subtle.encrypt(param[kind], key, message) as Promise<Uint8Array>
    })
}
export function decryptWithAES(kind: AESAlgorithmEnum, key: CryptoKey, iv: Uint8Array, message: Uint8Array) {
    const param = {
        [AESAlgorithmEnum.A256GCM]: { name: 'AES-GCM', iv } as AesGcmParams,
    } as const
    return Result.wrapAsync(async () => {
        return new Uint8Array(await crypto.subtle.decrypt(param[kind], key, message))
    })
}
export function assertIVLengthEq16(arrayBuffer: Uint8Array) {
    if (arrayBuffer.byteLength === 16) return Ok(arrayBuffer)
    return new CheckedError(CryptoException.InvalidIVLength, null).toErr()
}
