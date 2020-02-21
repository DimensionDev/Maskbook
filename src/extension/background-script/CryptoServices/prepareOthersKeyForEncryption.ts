import { ProfileIdentifier } from '../../../database/type'
import { queryPublicKey } from '../../../database'

/**
 * @internal
 */
export async function prepareOthersKeyForEncryptionV39OrV38(to: ProfileIdentifier[]): Promise<CryptoKey[]> {
    return Promise.all(to.map(queryPublicKey)).then(x => x.filter((y): y is CryptoKey => !!y))
}
