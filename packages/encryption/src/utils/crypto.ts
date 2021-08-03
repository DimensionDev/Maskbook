import { Result, Ok } from 'ts-results'
import { AESKeyParameterEnum, PublicKeyAlgorithmEnum } from '../payload'
import { Exception, ExceptionKinds } from '../types'

type AESParams = AesCbcParams | AesCfbParams | AesCtrParams | AesGcmParams | AesCmacParams

export function importAESFromJWK(key: JsonWebKey, kind: AESKeyParameterEnum) {
    return Result.wrapAsync(() => {
        const param: Record<AESKeyParameterEnum, AESParams> = {
            [AESKeyParameterEnum.AES_GCM_256]: { name: 'AES_GCM', length: 256 },
        }
        return crypto.subtle.importKey('jwk', key, param[kind], true, ['encrypt', 'decrypt'])
    })
}
importAESFromJWK.AES_GCM_256 = (x: JsonWebKey) => importAESFromJWK(x, AESKeyParameterEnum.AES_GCM_256)

export function importAsymmetryKeyFromJWK(key: JsonWebKey, kind: PublicKeyAlgorithmEnum) {
    return Result.wrapAsync(() => {
        if (kind === PublicKeyAlgorithmEnum.secp256k1) {
            return crypto.subtle.importKey('jwk', key, { name: 'ECDH', namedCurve: 'K-256' }, true, [
                'deriveKey',
                'deriveBits',
            ])
        } else if (kind === PublicKeyAlgorithmEnum.secp256p1) {
            return crypto.subtle.importKey('jwk', key, { name: 'ECDH', namedCurve: 'P-256' }, true, [
                'deriveKey',
                'deriveBits',
            ])
        } else {
            throw new Error('ed25519 not supported.')
        }
    })
}

export function decryptWithAES(kind: AESKeyParameterEnum, key: CryptoKey, iv: ArrayBuffer, message: ArrayBuffer) {
    return Result.wrapAsync(() => {
        const param: Record<AESKeyParameterEnum, AESParams> = {
            [AESKeyParameterEnum.AES_GCM_256]: { name: 'AES_GCM', iv },
        }
        return crypto.subtle.decrypt(param[kind], key, message)
    })
}
export function ensureIVLength16(arrayBuffer: ArrayBuffer) {
    if (arrayBuffer.byteLength === 16) return Ok(arrayBuffer)
    return new Exception(ExceptionKinds.InvalidPayload, 'iv is not length 16').toErr()
}
