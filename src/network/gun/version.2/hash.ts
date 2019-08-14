/**
 * @see https://github.com/DimensionDev/Maskbook/wiki/Data-structure-on-Gun-version-2
 */
import Gun from 'gun'
import { PersonIdentifier } from '../../../database/type'

const opt: Parameters<typeof Gun.SEA.work>[3] = {
    encode: 'base64',
    iterations: undefined,
    name: 'SHA-256',
}
const noop = () => {}

export async function hashPersonIdentifier(id: PersonIdentifier) {
    const hashPair = `f67a6a2c-fe66-4f47-bd1f-00a5603d1010`

    const hash = await Gun.SEA.work(id.toText(), hashPair, noop, opt)!
    return hash!
}

export async function hashPostSalt(postSalt: string) {
    const hashPair = `9283464d-ee4e-4e8d-a7f3-cf392a88133f`
    const N = 12

    const hash = (await Gun.SEA.work(postSalt, hashPair, noop, opt))!
    return hash.substring(0, N)
}

export async function hashCryptoKey(key: CryptoKey) {
    const hashPair = `10198a2f-205f-45a6-9987-3488c80113d0`
    const N = 12

    const jwk = JSON.stringify(await crypto.subtle.exportKey('jwk', key))
    const hash = (await Gun.SEA.work(jwk, hashPair, noop, opt))!
    return hash.substring(0, N)
}
