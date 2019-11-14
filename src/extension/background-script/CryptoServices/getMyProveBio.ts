import { compressSecp256k1Key } from '../../../utils/type-transform/SECP256k1-Compression'
import { ProfileIdentifier } from '../../../database/type'
import { getNetworkWorker } from '../../../social-network/worker'
import { queryPublicKey } from '../../../database'
//#endregion
//#region ProvePost, create & verify
export async function getMyProveBio(whoAmI: ProfileIdentifier): Promise<string | null> {
    const myIdentity = await queryPublicKey(whoAmI)
    if (!myIdentity) return null
    const pub = await crypto.subtle.exportKey('jwk', myIdentity)
    const compressed = compressSecp256k1Key(pub)
    return getNetworkWorker(whoAmI.network).publicKeyEncoder(compressed)
}
