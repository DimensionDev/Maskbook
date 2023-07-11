export type JsonWebKeyPair<Pub extends JsonWebKey & Nominal<unknown>, Priv extends JsonWebKey & Nominal<unknown>> = {
    publicKey: Pub
    privateKey: Priv
}
// Create nominal typing interfaces for different JsonWebKey type
// So they will no longer assignable to each other

export type EC_JsonWebKey = EC_Private_JsonWebKey | EC_Public_JsonWebKey
export interface EC_Public_JsonWebKey extends JsonWebKey, Nominal<'EC public'> {}
export interface EC_Private_JsonWebKey extends JsonWebKey, Nominal<'EC private'> {}
export interface AESJsonWebKey extends JsonWebKey, Nominal<'AES'> {}

export function isAESJsonWebKey(x: unknown): x is AESJsonWebKey {
    if (typeof x !== 'object' || x === null) return false
    const { alg, k, key_ops, kty } = x as JsonWebKey
    if (!alg || !k || !Array.isArray(key_ops) || kty !== 'oct') return false
    return true
}
export function isEC_JsonWebKey(o: unknown): o is EC_JsonWebKey {
    if (typeof o !== 'object' || o === null) return false
    const { crv, key_ops, kty, x, y } = o as JsonWebKey
    if (!crv || !Array.isArray(key_ops) || !kty || !x || !y) return false
    return true
}
export function isEC_Public_JsonWebKey(o: unknown): o is EC_Public_JsonWebKey {
    if (!isEC_JsonWebKey(o)) return false
    return !o.d
}
export function isEC_Private_JsonWebKey(o: unknown): o is EC_Private_JsonWebKey {
    if (!isEC_JsonWebKey(o)) return false
    return !!o.d
}
declare class Nominal<T> {
    /** Ghost property, don't use it! */
    private __brand: T
}
