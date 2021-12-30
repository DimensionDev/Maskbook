import type { AESName } from './interface.aes'
import type { JsonWebKeyPair, EC_Public_JsonWebKey, EC_Private_JsonWebKey, AESJsonWebKey } from '@masknet/shared-base'
type GenerateKeyPair = () => PromiseLike<JsonWebKeyPair<EC_Public_JsonWebKey, EC_Private_JsonWebKey>>
type DeriveAES = (
    priv: EC_Private_JsonWebKey,
    pub: EC_Public_JsonWebKey,
    aes: AESName,
    length: 256,
) => PromiseLike<AESJsonWebKey>
export interface ECMethods {
    generate_ec_k256_pair: GenerateKeyPair
    derive_aes_from_ecdh_k256: DeriveAES
}
