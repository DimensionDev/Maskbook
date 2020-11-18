/** This file should not contain active gun instances. Only static methods on gun is allowed. */
/**
 * @see https://github.com/DimensionDev/Maskbook/wiki/Data-structure-on-Gun-version-2
 */
import Gun from 'gun'
import 'gun/sea'
import type { ProfileIdentifier } from '../../../database/type'
import { memoizePromise } from '../../../utils/memoize'
import type { EC_Public_JsonWebKey } from '../../../modules/CryptoAlgorithm/interfaces/utils'

/**
 * @param version current payload version
 * @param postIV Post iv
 * @param partitionByCryptoKey Public key of the current user (receiver)
 * @param networkHint The network specific string
 */
export async function calculatePostKeyPartition(
    version: -39 | -38,
    postIV: string,
    partitionByCryptoKey: EC_Public_JsonWebKey,
    networkHint: string,
) {
    const postHash = await hashPostSalt(postIV, networkHint)
    // In version > -39, we will use stable hash to prevent unstable result for key hashing
    const keyHash = await (version <= -39 ? hashCryptoKeyUnstable : hashCryptoKey)(partitionByCryptoKey)
    return { postHash, keyHash }
}
export const hashProfileIdentifier = memoizePromise(
    async function hashProfileIdentifier(id: ProfileIdentifier) {
        const hashPair = `f67a6a2c-fe66-4f47-bd1f-00a5603d1010`

        const hash = await Gun.SEA.work(id.toText(), hashPair)!
        return hash!
    },
    (id) => id.toText(),
)

export const hashPostSalt = memoizePromise(
    async function (postSalt: string, networkHint: string) {
        const hashPair = `9283464d-ee4e-4e8d-a7f3-cf392a88133f`
        const N = 2

        const hash = (await Gun.SEA.work(postSalt, hashPair))!
        return networkHint + hash.substring(0, N)
    },
    (x, y) => x + y,
)

/**
 * @param key - The key need to be hashed
 */
export const hashCryptoKeyUnstable = memoizePromise(async function (key: EC_Public_JsonWebKey) {
    const hashPair = `10198a2f-205f-45a6-9987-3488c80113d0`
    const N = 2

    const jwk = JSON.stringify(key)
    const hash = (await Gun.SEA.work(jwk, hashPair))!
    return hash.substring(0, N)
}, undefined)

/**
 * @param key - The key need to be hashed
 */
export const hashCryptoKey = memoizePromise(async function (key: EC_Public_JsonWebKey) {
    const hashPair = `10198a2f-205f-45a6-9987-3488c80113d0`
    const N = 2

    const jwk = key
    if (!jwk.x || !jwk.y) throw new Error('Invalid key')
    const hash = (await Gun.SEA.work(jwk.x! + jwk.y!, hashPair))!
    return hash.substring(0, N)
}, undefined)
