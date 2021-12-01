import type { ShaName } from './interface'
import type { AESName } from './interface.aes'
import type { JsonWebKeyPair, EC_Public_JsonWebKey, EC_Private_JsonWebKey, AESJsonWebKey } from './utils'
type GenerateKeyPair = () => PromiseLike<JsonWebKeyPair<EC_Public_JsonWebKey, EC_Private_JsonWebKey>>
// type Sign = (ecdsa_key: EC_Private_JsonWebKey, hash: ShaName, message: ArrayBuffer) => PromiseLike<ArrayBuffer>
type Verify = (
    key: EC_Public_JsonWebKey,
    hash: ShaName,
    msg: ArrayBuffer,
    signature: ArrayBuffer,
) => PromiseLike<boolean>
type DeriveAES = (
    priv: EC_Private_JsonWebKey,
    pub: EC_Public_JsonWebKey,
    aes: AESName,
    length: 256,
) => PromiseLike<AESJsonWebKey>
export interface ECMethods {
    generate_ec_k256_pair: GenerateKeyPair
    // generate_ec_p256_pair: GenerateKeyPair
    // generate_ec_p384_pair: GenerateKeyPair
    // generate_ec_p512_pair: GenerateKeyPair
    // generate_ec_ed25519_pair: GenerateKeyPair
    // sign_ecdsa_k256: Sign
    // sign_ecdsa_p256: ECMethodsSignSignature
    // sign_ecdsa_p384: ECMethodsSignSignature
    // sign_ecdsa_p512: ECMethodsSignSignature
    // sign_ecdsa_ed25519: ECMethodsSignSignature
    // verify_ecdsa_k256: Verify
    // verify_ecdsa_p256: ECMethodsVerifySignature
    // verify_ecdsa_p384: ECMethodsVerifySignature
    // verify_ecdsa_p512: ECMethodsVerifySignature
    // verify_ecdsa_ed25519: ECMethodsVerifySignature
    derive_aes_from_ecdh_k256: DeriveAES
    // derive_aes_from_ecdh_p256: ECMethodsDeriveAESSignature
    // derive_aes_from_ecdh_p384: ECMethodsDeriveAESSignature
    // derive_aes_from_ecdh_p512: ECMethodsDeriveAESSignature
    // derive_aes_from_ecdh_ed25519: ECMethodsDeriveAESSignature
}
