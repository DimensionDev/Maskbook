import { queryPersonDB } from '../../database/people'
import { PersonIdentifier } from '../../database/type'
/**
 * @internal
 */
export async function prepareOthersKeyForEncryptionV40(
    to: PersonIdentifier[],
): Promise<
    {
        name: string
        key: CryptoKey
    }[]
> {
    const data = await Promise.all(to.map(queryPersonDB))
    return data
        .filter((x): x is NonNullable<typeof x> => !!x)
        .map(x => ({ name: x.identifier.userId, key: x.publicKey! }))
}
/**
 * @internal
 */
export async function prepareOthersKeyForEncryptionV39(to: PersonIdentifier[]): Promise<CryptoKey[]> {
    const data = await Promise.all(to.map(queryPersonDB))
    return data
        .filter(x => x)
        .map(x => x!.publicKey!)
        .filter(x => x)
}
