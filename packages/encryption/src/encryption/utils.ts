import type { EC_Public_CryptoKey, EC_Private_CryptoKey } from '@masknet/shared-base'
import { EC_KeyCurveEnum } from '../payload'
import type { EncryptIO } from './Encryption'

/** @internal */
export type EphemeralKeys = Map<
    EC_KeyCurveEnum,
    readonly [EC_Public_CryptoKey, EC_Private_CryptoKey] | Promise<readonly [EC_Public_CryptoKey, EC_Private_CryptoKey]>
>
/** @internal */
export function createEphemeralKeysMap(io: Pick<EncryptIO, 'getRandomECKey'>) {
    const ephemeralKeys: EphemeralKeys = new Map()

    // get ephemeral keys, generate one if not found
    async function getEphemeralKey(curve: EC_KeyCurveEnum) {
        if (ephemeralKeys.has(curve)) return ephemeralKeys.get(curve)!
        ephemeralKeys.set(curve, generateEC_KeyPair(io, curve))
        return ephemeralKeys.get(curve)!
    }
    return { ephemeralKeys, getEphemeralKey }
}

/** @internal */
export function fillIV(io: Pick<EncryptIO, 'getRandomValues'>): Uint8Array {
    if (io.getRandomValues) return io.getRandomValues(new Uint8Array(16))
    return crypto.getRandomValues(new Uint8Array(16))
}

async function generateEC_KeyPair(io: Pick<EncryptIO, 'getRandomECKey'>, kind: EC_KeyCurveEnum) {
    if (io.getRandomECKey) return io.getRandomECKey(kind)
    const namedCurve: Record<EC_KeyCurveEnum, string> = {
        [EC_KeyCurveEnum.secp256p1]: 'P-256',
        [EC_KeyCurveEnum.secp256k1]: 'K-256',
    }
    const { privateKey, publicKey } = await crypto.subtle.generateKey(
        { name: 'ECDH', namedCurve: namedCurve[kind] },
        true,
        ['deriveKey'],
    )
    return [publicKey as EC_Public_CryptoKey, privateKey as EC_Private_CryptoKey] as const
}
