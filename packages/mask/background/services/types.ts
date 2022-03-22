import type * as Crypto from './crypto'
import type { decryptionWithSocialNetworkDecoding } from './crypto/decryption'
import type * as Helper from './helper'
export type Services = {
    Crypto: Omit<typeof Crypto, 'decryptionWithSocialNetworkDecoding'>
    Helper: typeof Helper
}
export type GeneratorServices = {
    decryption: typeof decryptionWithSocialNetworkDecoding
}
