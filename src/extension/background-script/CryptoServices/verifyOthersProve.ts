import { decodeArrayBuffer } from '../../../utils/type-transform/String-ArrayBuffer'
import { geti18nString } from '../../../utils/i18n'
import { unCompressSecp256k1Point } from '../../../utils/type-transform/SECP256k1-Compression'
import { storeNewPersonDB } from '../../../database/people'
import { PersonIdentifier } from '../../../database/type'
import { getActivatedWorker } from '../../../social-network/worker'
import { import_ECDH_256k1_Key } from '../../../utils/crypto.subtle'

export async function verifyOthersProve(bio: string, others: PersonIdentifier): Promise<boolean> {
    const compressedX = getActivatedWorker(others.network).publicKeyDecoder(bio)
    if (!compressedX) return false
    const { x, y } = unCompressSecp256k1Point(decodeArrayBuffer(compressedX))
    const key: JsonWebKey = {
        crv: 'K-256',
        ext: true,
        x: x,
        y: y,
        key_ops: ['deriveKey'],
        kty: 'EC',
    }
    let publicKey: CryptoKey
    try {
        publicKey = await import_ECDH_256k1_Key(key)
    } catch {
        throw new Error(geti18nString('service_key_parse_failed'))
    }
    storeNewPersonDB({
        identifier: others,
        groups: [],
        publicKey: publicKey,
    })
    return true
}
