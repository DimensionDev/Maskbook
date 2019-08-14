import { queryPersonDB } from '../../database/people'
import { PersonIdentifier } from '../../database/type'
/**
 * @internal
 */
export async function prepareOthersKeyForEncryption(
    to: PersonIdentifier[],
): Promise<
    {
        name: string
        key: CryptoKey
    }[]
> {
    const data = await Promise.all(to.map(x => x).map(queryPersonDB))
    return data
        .filter((x): x is NonNullable<typeof x> => !!x)
        .map(x => ({ name: x.identifier.userId, key: x.publicKey! }))
}
