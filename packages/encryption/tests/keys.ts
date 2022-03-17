/* cspell:disable */
import './setup'
import { test } from '@jest/globals'
import type { AESCryptoKey, EC_Private_CryptoKey, EC_Public_CryptoKey, ProfileIdentifier } from '@masknet/shared-base'
import { type EC_Key, EC_KeyCurveEnum } from '../src/payload'
import { importEC_Key } from '../src/utils'
test('test keys', () => {})

const alice_K256_publicKey = {
    x: 'r9tVYAq-h0m5REaTd6eMTWBSK7ZIQszwggoiU0ao5Yw',
    y: 'kx1ZdZAABlMcRqc_hLM6A3Vd--Vn7FBMRw3SREQN1j4',
    ext: true,
    key_ops: ['deriveKey', 'deriveBits'],
    crv: 'K-256',
    kty: 'EC',
}
const bob_k256_private = {
    d: 'nBCGN_msxMU7v8F2aDOXJxPqWSqdsTJOWw55OfNnvnU',
    x: '-90aGe60hORM7XYMFB_xhbS-8uuJmKBSBUy35FSHFr8',
    y: 'EDK3u9rl3YgeQM-Y5A0Za_0fDcLSDDyPcebrczC18aE',
    ext: true,
    key_ops: ['deriveKey'],
    crv: 'K-256',
    kty: 'EC',
}
const bob_localKey = {
    alg: 'A256GCM',
    ext: true,
    k: 'ZlIcRMamDiiScGeSv_4B3mW1gKGew8knz_FZt2b7Cys',
    key_ops: ['encrypt'],
    kty: 'oct',
}
const jack_k256_private = {
    d: 'p_iwDlnyRWcKtfReb_XTmypLDUmdsqEzzERxPEmjCys',
    x: '-7iUBcLcwDLjvRNo_12mkBWWoairAGgDwV9RbbLtTT0',
    y: 'bMKjWpYz3p_ysN9A_STKPd8U8eO7qsY81HmQpZTu6XA',
    ext: true,
    key_ops: ['deriveKey'],
    crv: 'K-256',
    kty: 'EC',
}

export function getTestRandomAESKey() {
    const aesKeys = [
        {
            alg: 'A256GCM',
            ext: true,
            k: 'x4E0fVsEz57G8Ou7d8b7ng1HOtBheGCSlXEkjbiShKY',
            key_ops: ['encrypt'],
            kty: 'oct',
        },
    ]
    return async () => {
        if (aesKeys.length === 0) throw new Error('No more keys')
        const key = aesKeys.shift()!
        return (await crypto.subtle.importKey('jwk', key, { name: 'AES-GCM', length: 256 }, true, [
            'encrypt',
        ])) as AESCryptoKey
    }
}

export function getTestRandomECKey() {
    const ecKeys = [
        {
            d: 'ayziBcMR44wZsxwwHVilMslgrivkiNnr8roH_U32AiA',
            x: 'ZAwFdNu6C-AOfm8AgPsvRCj3IkW1rbTTvZVpTWRaayQ',
            y: 'I8bQm6twdaG59j18Z2AYm8awz6NB6hvp_j2Llf2jcmg',
            ext: true,
            key_ops: ['deriveKey'],
            crv: 'K-256',
            kty: 'EC',
        },
    ]
    return async () => {
        if (ecKeys.length === 0) throw new Error('No more keys')
        const key = ecKeys.shift()!
        const a = await toPublic(key)
        const b = await toPrivate(key)
        return [a.key, b.key] as const
    }
}

export function getRandomValues() {
    const random = [
        new Uint8Array([103, 255, 64, 75, 77, 251, 1, 164, 34, 237, 4, 16, 126, 175, 142, 35]),
        new Uint8Array([150, 164, 124, 165, 4, 65, 142, 140, 96, 64, 241, 15, 128, 231, 32, 186]),
    ]
    return (uint8Array: Uint8Array) => {
        if (random.length === 0) throw new Error('No more random values')
        uint8Array.set(random.shift()!)
        return uint8Array
    }
}

export async function queryTestPublicKey(id: ProfileIdentifier) {
    if (id.userId === 'alice') return toPublic(alice_K256_publicKey)
    if (id.userId === 'bob') return toPublic(bob_k256_private)
    if (id.userId === 'jack') return toPublic(jack_k256_private)
    return null
}
export function deriveAESKey(as: 'bob' | 'jack') {
    const keys = [toPrivate(bob_k256_private), toPrivate(jack_k256_private)]
    return async (pub: EC_Public_CryptoKey) => {
        const k = (await Promise.all(keys))[as === 'bob' ? 0 : 1]
        return [
            await crypto.subtle.deriveKey(
                { name: 'ECDH', public: pub },
                k.key,
                { name: 'AES-GCM', length: 256 },
                false,
                ['decrypt'],
            ),
        ] as AESCryptoKey[]
    }
}

async function toPublic({
    d,
    ...key
}: typeof alice_K256_publicKey & { d?: string }): Promise<EC_Key<EC_Public_CryptoKey>> {
    const x = await importEC_Key(key, EC_KeyCurveEnum.secp256k1)
    return { algr: EC_KeyCurveEnum.secp256k1, key: x.unwrap() as EC_Public_CryptoKey }
}
async function toPrivate(key: typeof jack_k256_private) {
    const x = await importEC_Key(key, EC_KeyCurveEnum.secp256k1)
    return { algr: EC_KeyCurveEnum.secp256k1, key: x.unwrap() as EC_Private_CryptoKey }
}
