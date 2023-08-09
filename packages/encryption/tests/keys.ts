/* cspell:disable */
import { test } from 'vitest'
import type { AESCryptoKey, EC_Private_CryptoKey, EC_Public_CryptoKey, ProfileIdentifier } from '@masknet/base'
import { type EC_Key, EC_KeyCurve, importEC_Key } from '../src/index.js'
import { unreachable } from '@masknet/kit'
import { None, type Option, Some } from 'ts-results-es'
test('test keys', () => {})

const alice_K256_publicKey = {
    x: 'r9tVYAq-h0m5REaTd6eMTWBSK7ZIQszwggoiU0ao5Yw',
    y: 'kx1ZdZAABlMcRqc_hLM6A3Vd--Vn7FBMRw3SREQN1j4',
    ext: true,
    key_ops: ['deriveKey'],
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
    key_ops: ['encrypt', 'decrypt'],
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
const joey_k256_private = {
    d: 'BjMKJdp1u_ZRP7j0defYFMdaA1qYTm_F4A8MG8YFSCI',
    x: 'phWxCscx9XzhK1QpxZwdOCY8qFt-GcYvJ-AVzYTQ9FM',
    y: 'dfzGWykbyGA0xwpznlKY9NJ7IUL2Vke991gyyZi08Cc',
    ext: true,
    key_ops: ['deriveKey'],
    crv: 'K-256',
    kty: 'EC',
}

export async function getBobLocalKey(): Promise<AESCryptoKey> {
    const x = await crypto.subtle.importKey('jwk', bob_localKey, { name: 'AES-GCM', length: 256 }, true, [
        'encrypt',
        'decrypt',
    ])
    return x as AESCryptoKey
}
export function encryptDecryptWith(f: typeof getBobLocalKey) {
    return {
        async encrypt(message: Uint8Array, iv: Uint8Array) {
            const key = await f()
            return crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, message)
        },
        async decrypt(message: Uint8Array, iv: Uint8Array) {
            const key = await f()
            return crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, message)
        },
    }
}
export function getTestRandomAESKey() {
    const aesKeys = [
        {
            alg: 'A256GCM',
            ext: true,
            k: 'x4E0fVsEz57G8Ou7d8b7ng1HOtBheGCSlXEkjbiShKY',
            key_ops: ['encrypt', 'decrypt'],
            kty: 'oct',
        },
    ]
    return async () => {
        if (aesKeys.length === 0) throw new Error('No more keys')
        const key = aesKeys.shift()!
        return (await crypto.subtle.importKey('jwk', key, { name: 'AES-GCM', length: 256 }, true, [
            'encrypt',
            'decrypt',
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

export async function queryTestPublicKey(id: ProfileIdentifier): Promise<Option<EC_Key<EC_Public_CryptoKey>>> {
    if (id.userId === 'alice') return Some(await toPublic(alice_K256_publicKey))
    if (id.userId === 'bob') return Some(await toPublic(bob_k256_private))
    if (id.userId === 'jack') return Some(await toPublic(jack_k256_private))
    if (id.userId === 'joey') return Some(await toPublic(joey_k256_private))
    return None
}

type Person = 'bob' | 'jack' | 'joey'
export function deriveAESKey(as: Person, type: 'single'): (pub: EC_Public_CryptoKey) => Promise<AESCryptoKey>
export function deriveAESKey(as: Person, type: 'array'): (pub: EC_Public_CryptoKey) => Promise<AESCryptoKey[]>
export function deriveAESKey(as: Person, type: 'array' | 'single') {
    return async (pub: EC_Public_CryptoKey) => {
        const k = await (() => {
            if (as === 'bob') return toPrivate(bob_k256_private)
            if (as === 'jack') return toPrivate(jack_k256_private)
            if (as === 'joey') return toPrivate(joey_k256_private)
            unreachable(as)
        })()
        const key = (await crypto.subtle.deriveKey(
            { name: 'ECDH', public: pub },
            k.key,
            { name: 'AES-GCM', length: 256 },
            true,
            ['decrypt', 'encrypt'],
        )) as AESCryptoKey
        if (type === 'array') return [key]
        return key
    }
}

async function toPublic({
    d,
    ...key
}: typeof alice_K256_publicKey & {
    d?: string
}): Promise<EC_Key<EC_Public_CryptoKey>> {
    const x = await importEC_Key(key, EC_KeyCurve.secp256k1)
    return { algr: EC_KeyCurve.secp256k1, key: x.unwrap() as EC_Public_CryptoKey }
}
async function toPrivate(key: typeof jack_k256_private) {
    const x = await importEC_Key(key, EC_KeyCurve.secp256k1)
    return { algr: EC_KeyCurve.secp256k1, key: x.unwrap() as EC_Private_CryptoKey }
}
