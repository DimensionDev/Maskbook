import type * as Crypto from './crypto'
import type * as Helper from './helper'
export type Services = {
    Crypto: Omit<typeof Crypto, 'decryptionWithSocialNetworkDecoding'>
    Helper: typeof Helper
}
export type GeneratorServices = {
    decryption: typeof Crypto['decryptionWithSocialNetworkDecoding']
}
