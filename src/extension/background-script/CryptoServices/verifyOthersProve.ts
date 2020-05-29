import { decompressSecp256k1Key } from '../../../utils/type-transform/SECP256k1-Compression'
import { ProfileIdentifier, ECKeyIdentifier } from '../../../database/type'
import { getNetworkWorker } from '../../../social-network/worker'
import { createProfileWithPersona, queryPersonaRecord } from '../../../database'

export async function verifyOthersProve(bio: string, others: ProfileIdentifier): Promise<boolean> {
    const compressedX = getNetworkWorker(others.network).publicKeyDecoder(bio)
    if (!compressedX) return false
    const publicKey = compressedX
        .map((x) => {
            try {
                return decompressSecp256k1Key(x, 'public')
            } catch {
                return null
            }
        })
        .filter((x) => x)[0]
    if (!publicKey) throw new Error('No key was found')
    // TODO: use json schema / other ways to verify the JWK
    // or
    // throw new Error(i18n.t('service_key_parse_failed'))
    // if privateKey, we should possibly not recreate it
    const hasPrivate =
        (await queryPersonaRecord(ECKeyIdentifier.fromJsonWebKey(publicKey)))?.privateKey ||
        (await queryPersonaRecord(others))?.privateKey
    if (!hasPrivate) await createProfileWithPersona(others, { connectionConfirmState: 'pending' }, { publicKey })
    // TODO: unhandled case: if the profile is connected but a different key.
    return true
}
