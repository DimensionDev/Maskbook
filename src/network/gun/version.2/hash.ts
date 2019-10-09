/**
 * @see https://github.com/DimensionDev/Maskbook/wiki/Data-structure-on-Gun-version-2
 */
import Gun from 'gun'
import { PersonIdentifier } from '../../../database/type'
import { memoizePromise } from '../../../utils/memoize'
import { CryptoKeyToJsonWebKey } from '../../../utils/type-transform/CryptoKey-JsonWebKey'

export const hashPersonIdentifier = memoizePromise(
    async function hashPersonIdentifier(id: PersonIdentifier) {
        const hashPair = `f67a6a2c-fe66-4f47-bd1f-00a5603d1010`

        const hash = await Gun.SEA.work(id.toText(), hashPair)!
        return hash!
    },
    id => id.toText(),
)

export const hashPostSalt = memoizePromise(async function(postSalt: string) {
    const hashPair = `9283464d-ee4e-4e8d-a7f3-cf392a88133f`
    const N = 2

    const hash = (await Gun.SEA.work(postSalt, hashPair))!
    return hash.substring(0, N)
})

/**
 * @param key - The key need to be hashed
 * @param stableHash - Set this to true if you're writing new code.
 * Unstable hash may cause problem but we cannot just switch to stable hash
 * because it may breaks current data.
 */
export const hashCryptoKey = memoizePromise(async function(key: CryptoKey, stableHash: boolean) {
    const hashPair = `10198a2f-205f-45a6-9987-3488c80113d0`
    const N = 2

    if (stableHash === true) {
        const jwk = await CryptoKeyToJsonWebKey(key)
        if (!jwk.x || !jwk.y) throw new Error('Invalid key')
        const hash = (await Gun.SEA.work(jwk.x! + jwk.y!, hashPair))!
        return hash.substring(0, N)
    } else {
        const jwk = JSON.stringify(await CryptoKeyToJsonWebKey(key))
        const hash = (await Gun.SEA.work(jwk, hashPair))!
        return hash.substring(0, N)
    }
})
