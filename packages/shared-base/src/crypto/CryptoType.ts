// Create nominal typing interfaces for different CryptoKey type
// So they will no longer assignable to each other

export type EC_CryptoKey = EC_Private_CryptoKey | EC_Public_CryptoKey
export interface EC_Public_CryptoKey extends CryptoKey, Nominal<'EC public'> {}
export interface EC_Private_CryptoKey extends CryptoKey, Nominal<'EC private'> {}
export interface AESCryptoKey extends CryptoKey, Nominal<'AES'> {}
export interface PBKDF2CryptoKey extends Nominal<'PBKDF2'> {}
declare class Nominal<T> {
    /** Ghost property, don't use it! */
    private __brand: T
}
