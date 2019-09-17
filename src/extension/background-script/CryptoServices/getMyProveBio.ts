import { encodeArrayBuffer } from '../../../utils/type-transform/String-ArrayBuffer'
import { toCompressSecp256k1Point } from '../../../utils/type-transform/SECP256k1-Compression'
import { queryMyIdentityAtDB } from '../../../database/people'
import { PersonIdentifier } from '../../../database/type'
import { getActivatedWorker } from '../../../social-network/worker'
//#endregion
//#region ProvePost, create & verify
export async function getMyProveBio(whoAmI: PersonIdentifier): Promise<string | null> {
    const myIdentity = await queryMyIdentityAtDB(whoAmI)
    if (!myIdentity) return null
    const pub = await crypto.subtle.exportKey('jwk', myIdentity.publicKey)
    const compressed = toCompressSecp256k1Point(pub.x!, pub.y!)
    return getActivatedWorker(whoAmI.network).publicKeyEncoder(encodeArrayBuffer(compressed))
}
