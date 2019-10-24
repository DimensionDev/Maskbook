import { queryPersonDB } from '../../database/people'
import { PersonIdentifier } from '../../database/type'

/**
 * @internal
 */
export async function prepareOthersKeyForEncryptionV39OrV38(to: PersonIdentifier[]): Promise<CryptoKey[]> {
    const data = await Promise.all(to.map(queryPersonDB))
    return data
        .filter(x => x)
        .map(x => x!.publicKey!)
        .filter(x => x)
}
