import { geti18nString } from '../../../utils/i18n'
import { decompressSecp256k1Key } from '../../../utils/type-transform/SECP256k1-Compression'
import { ProfileIdentifier } from '../../../database/type'
import { getNetworkWorker } from '../../../social-network/worker'
import { import_ECDH_256k1_Key } from '../../../utils/crypto.subtle'
import { createProfileWithPersona } from '../../../database'

export async function verifyOthersProve(bio: string, others: ProfileIdentifier): Promise<boolean> {
    const compressedX = getNetworkWorker(others.network).publicKeyDecoder(bio)
    if (!compressedX) return false
    const key = decompressSecp256k1Key(compressedX)
    try {
        // verify if this key is a valid key
        await import_ECDH_256k1_Key(key)
    } catch {
        throw new Error(geti18nString('service_key_parse_failed'))
    }
    await createProfileWithPersona(others, { connectionConfirmState: 'pending' }, { publicKey: key })
    return true
}
