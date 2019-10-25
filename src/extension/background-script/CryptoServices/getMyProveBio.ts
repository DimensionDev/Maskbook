import { compressSecp256k1Key } from '../../../utils/type-transform/SECP256k1-Compression'
import { queryMyIdentityAtDB } from '../../../database/people'
import { PersonIdentifier } from '../../../database/type'
import { getNetworkWorker } from '../../../social-network/worker'
//#endregion
//#region ProvePost, create & verify
export async function getMyProveBio(whoAmI: PersonIdentifier): Promise<string | null> {
    const myIdentity = await queryMyIdentityAtDB(whoAmI)
    if (!myIdentity) return null
    const pub = await crypto.subtle.exportKey('jwk', myIdentity.publicKey)
    const compressed = compressSecp256k1Key(pub)
    return getNetworkWorker(whoAmI.network).publicKeyEncoder(compressed)
}
