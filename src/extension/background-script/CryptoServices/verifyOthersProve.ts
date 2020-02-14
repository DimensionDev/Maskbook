import { decompressSecp256k1Key } from '../../../utils/type-transform/SECP256k1-Compression'
import { ProfileIdentifier, ECKeyIdentifier } from '../../../database/type'
import { getNetworkWorker } from '../../../social-network/worker'
import { import_ECDH_256k1_Key } from '../../../utils/crypto.subtle'
import { createProfileWithPersona, queryPersonaRecord } from '../../../database'
import { i18n } from '../../../utils/i18n-next'

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
        throw new Error(i18n.t('service_key_parse_failed'))
    }
    // if privateKey, we should possibly not recreate it
    const hasPrivate =
        (await queryPersonaRecord(ECKeyIdentifier.fromJsonWebKey(key)))?.privateKey ||
        (await queryPersonaRecord(others))?.privateKey
    if (!hasPrivate) await createProfileWithPersona(others, { connectionConfirmState: 'pending' }, { publicKey: key })
    // TODO: unhandled case: if the profile is connected but a different key.
    return true
}
