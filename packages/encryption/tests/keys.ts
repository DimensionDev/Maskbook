/* cspell:disable */
import './setup'
import { test } from '@jest/globals'
import type { EC_Public_CryptoKey, ProfileIdentifier } from '@masknet/shared-base'
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
export async function queryTestPublicKey(id: ProfileIdentifier) {
    if (id.userId === 'alice') return toPublic(alice_K256_publicKey)
    if (id.userId === 'bob') return toPublic(bob_k256_private)
    return null
}

async function toPublic({
    d,
    ...key
}: typeof alice_K256_publicKey & { d?: string }): Promise<EC_Key<EC_Public_CryptoKey>> {
    const x = await importEC_Key(key, EC_KeyCurveEnum.secp256k1)
    return { algr: EC_KeyCurveEnum.secp256k1, key: x.unwrap() as EC_Public_CryptoKey }
}
