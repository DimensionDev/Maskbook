import { decompressSecp256k1Key } from '../../../utils/type-transform/SECP256k1-Compression'
import { ECKeyIdentifierFromJsonWebKey, ProfileIdentifier } from '../../../database/type'
import { decodePublicKeyWorker } from '../../../social-network/utils/text-payload-worker'
import { createProfileWithPersona, queryPersonaRecord } from '../../../database'

export async function verifyOthersProve(bio: string | { raw: string }, others: ProfileIdentifier): Promise<boolean> {
    const compressedX = typeof bio === 'string' ? (await decodePublicKeyWorker(others.network))(bio) : [bio.raw]
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
        (await queryPersonaRecord(ECKeyIdentifierFromJsonWebKey(publicKey)))?.privateKey ||
        (await queryPersonaRecord(others))?.privateKey
    if (!hasPrivate) await createProfileWithPersona(others, { connectionConfirmState: 'pending' }, { publicKey })
    // TODO: unhandled case: if the profile is connected but a different key.
    return true
}
