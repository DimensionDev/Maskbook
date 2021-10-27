import { Result, Ok } from 'ts-results'
import { AESAlgorithmEnum, PublicKeyAlgorithmEnum } from '../payload'
import { EKindsError, EKinds } from '../types'

export function importAESFromJWK(key: JsonWebKey, kind: AESAlgorithmEnum) {
    return Result.wrapAsync(() => {
        const param: Record<AESAlgorithmEnum, AesKeyAlgorithm> = {
            [AESAlgorithmEnum.AES_GCM_256]: {
                name: 'AES_GCM',
                length: 256,
            },
        }
        return crypto.subtle.importKey('jwk', key, param[kind], true, ['encrypt', 'decrypt'])
    })
}
importAESFromJWK.AES_GCM_256 = (key: JsonWebKey) => importAESFromJWK(key, AESAlgorithmEnum.AES_GCM_256)

export function importAsymmetryKeyFromJsonWebKeyOrSPKI(key: JsonWebKey | ArrayBuffer, kind: PublicKeyAlgorithmEnum) {
    const DeriveKeyUsage: KeyUsage[] = ['deriveKey', 'deriveBits']
    const ImportParamsMap = {
        [PublicKeyAlgorithmEnum.secp256k1]: { name: 'ECDH', namedCurve: 'K-256' } as EcKeyImportParams,
        [PublicKeyAlgorithmEnum.secp256p1]: { name: 'ECDH', namedCurve: 'P-256' } as EcKeyImportParams,
    } as const
    return Result.wrapAsync(async () => {
        if (kind === PublicKeyAlgorithmEnum.ed25519) {
            throw new EKindsError(EKinds.UnsupportedAlgorithm, 'TODO: support ED25519')
        }
        if (key instanceof ArrayBuffer) {
            return crypto.subtle.importKey('spki', key, ImportParamsMap[kind], true, DeriveKeyUsage)
        } else {
            return crypto.subtle.importKey('jwk', key, ImportParamsMap[kind], true, DeriveKeyUsage)
        }
    })
}

export function decryptWithAES(kind: AESAlgorithmEnum, key: CryptoKey, iv: ArrayBuffer, message: ArrayBuffer) {
    const param = {
        [AESAlgorithmEnum.AES_GCM_256]: { name: 'AES_GCM', iv } as AesGcmParams,
    } as const
    return Result.wrapAsync(() => {
        return crypto.subtle.decrypt(param[kind], key, message)
    })
}
export function assertIVLengthEq16(arrayBuffer: ArrayBuffer) {
    if (arrayBuffer.byteLength === 16) return Ok(arrayBuffer)
    return new EKindsError(EKinds.InvalidPayload, 'iv is not length 16').toErr()
}
