import { geti18nString } from '../../../utils/i18n'
import { decompressSecp256k1Key } from '../../../utils/type-transform/SECP256k1-Compression'
import { ProfileIdentifier, ECKeyIdentifier } from '../../../database/type'
import { getNetworkWorker } from '../../../social-network/worker'
import { import_ECDH_256k1_Key } from '../../../utils/crypto.subtle'
import { createProfileWithPersona, queryPersonaRecord } from '../../../database'

export async function verifyOthersProve(bio: string, others: ProfileIdentifier): Promise<boolean> {
    const compressedX = getNetworkWorker(others.network).publicKeyDecoder(bio)
    if (!compressedX) return false
    const key = compressedX
        .map(x => {
            try {
                return decompressSecp256k1Key(x, 'public')
            } catch {
                return null
            }
        })
        .filter(x => x)[0]
    if (!key) throw new Error('No key was found')
    try {
        // verify if this key is a valid key
        await import_ECDH_256k1_Key(key)
    } catch {
        throw new Error(geti18nString('service_key_parse_failed'))
    }
    // if privateKey, we should possibly not recreate it
    const jwk =
        (await queryPersonaRecord(ECKeyIdentifier.fromJsonWebKey(key)))?.privateKey ||
        (await queryPersonaRecord(others))?.privateKey
    if (!jwk) await createProfileWithPersona(others, { connectionConfirmState: 'pending' }, { publicKey: key })
    return true
}
