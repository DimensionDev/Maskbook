import { geti18nString } from '../../../utils/i18n'
import { decompressSecp256k1Key } from '../../../utils/type-transform/SECP256k1-Compression'
import { storeNewPersonDB } from '../../../database/people'
import { PersonIdentifier } from '../../../database/type'
import { getNetworkWorker } from '../../../social-network/worker'
import { import_ECDH_256k1_Key } from '../../../utils/crypto.subtle'

export async function verifyOthersProve(bio: string, others: PersonIdentifier): Promise<boolean> {
    const compressedX = getNetworkWorker(others.network).publicKeyDecoder(bio)
    if (!compressedX) return false
    const key = compressedX
        .map(x => {
            try {
                decompressSecp256k1Key(x, 'public')
            } catch {
                return null
            }
        })
        .filter(x => x)[0]
    if (!key) throw new Error('No key was found')
    let publicKey: CryptoKey
    try {
        publicKey = await import_ECDH_256k1_Key(key)
    } catch {
        throw new Error(geti18nString('service_key_parse_failed'))
    }
    storeNewPersonDB({
        identifier: others,
        groups: [],
        publicKey,
    })
    return true
}
