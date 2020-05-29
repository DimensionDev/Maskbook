import { compressSecp256k1Key } from '../../../utils/type-transform/SECP256k1-Compression'
import { ProfileIdentifier, PersonaIdentifier } from '../../../database/type'
import { getNetworkWorker } from '../../../social-network/worker'
import { queryPublicKey } from '../../../database'
//#endregion
//#region ProvePost, create & verify
export async function getMyProveBio(
    whoAmI: ProfileIdentifier | PersonaIdentifier,
    networkHint?: string,
): Promise<string | null> {
    const myIdentity = await queryPublicKey(whoAmI)
    if (!myIdentity) return null
    const compressed = compressSecp256k1Key(myIdentity, 'public')
    // FIXME: wait for #191
    return whoAmI instanceof ProfileIdentifier
        ? getNetworkWorker(whoAmI.network).publicKeyEncoder(compressed)
        : networkHint
        ? getNetworkWorker(networkHint).publicKeyEncoder(compressed)
        : compressed
}
