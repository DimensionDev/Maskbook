import { compressSecp256k1Key } from '../../../utils/type-transform/SECP256k1-Compression'
import { ProfileIdentifier, PersonaIdentifier } from '../../../database/type'
import { encodePublicKeyWorker } from '../../../social-network/utils/text-payload-worker'
import { queryPublicKey } from '../../../database'

export async function getMyProveBio(
    whoAmI: ProfileIdentifier | PersonaIdentifier,
    networkIdentifier?: string,
): Promise<string | null> {
    const myIdentity = await queryPublicKey(whoAmI)
    if (!myIdentity) return null
    const compressed = compressSecp256k1Key(myIdentity, 'public')
    return whoAmI instanceof ProfileIdentifier
        ? (await encodePublicKeyWorker(whoAmI))(compressed)
        : networkIdentifier
        ? (await encodePublicKeyWorker(networkIdentifier))(compressed)
        : compressed
}
