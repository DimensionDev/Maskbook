import './elliptic-loader'
import 'webcrypto-liner'
import { WebCryptoNotSupportedMethods, WebCryptoSupportedMethods, WebCryptoMethods } from '../WebCrypto'
import {
    getKeyParameter,
    CryptoKeyToJsonWebKey,
    JsonWebKeyToCryptoKey,
} from '../../../utils/type-transform/CryptoKey-JsonWebKey'
import {
    generate_ECDH_256k1_KeyPair_ByMnemonicWord,
    recover_ECDH_256k1_KeyPair_ByMnemonicWord,
    MnemonicGenerationInformation,
} from '../../../utils/mnemonic-code'

const ECDH = getKeyParameter('ecdh')[0]
const ECDSA = getKeyParameter('ecdsa')[0]
function initEllipticBackend(_: WebCryptoSupportedMethods): WebCryptoNotSupportedMethods {
    return {
        async generate_ec_k256_pair(name) {
            const { privateKey, publicKey } = await crypto.subtle.generateKey(
                { name: 'ECDH', namedCurve: 'K-256' },
                true,
                [...(name === 'ECDH' ? ECDH : ECDSA)],
            )
            return { private: await CryptoKeyToJsonWebKey(privateKey), public: await CryptoKeyToJsonWebKey(publicKey) }
        },
        async sign_ecdsa_k256(key, hash, message) {
            return crypto.subtle.sign(
                { name: 'ECDSA', hash: { name: hash } },
                await JsonWebKeyToCryptoKey(key, ...getKeyParameter('ecdsa')),
                message,
            )
        },
        async verify_ecdsa_k256(key, hash, message, signature) {
            return crypto.subtle.verify(
                { name: 'ECDSA', hash: { name: hash } },
                await JsonWebKeyToCryptoKey(key, ...getKeyParameter('ecdsa')),
                signature,
                message,
            )
        },
        async derive_aes_from_ecdh_k256(priv, pub, aes, length) {
            return crypto.subtle
                .deriveKey(
                    { name: 'ECDH', public: await JsonWebKeyToCryptoKey(pub, ...getKeyParameter('ecdh')) },
                    await JsonWebKeyToCryptoKey(priv, ...getKeyParameter('ecdh')),
                    { name: aes, length },
                    true,
                    ['encrypt', 'decrypt'],
                )
                .then(CryptoKeyToJsonWebKey)
        },
        async generate_ecdh_k256_from_mnemonic(password) {
            return _helper(await generate_ECDH_256k1_KeyPair_ByMnemonicWord(password))
        },
        async recover_ecdh_k256_from_mnemonic(words, password) {
            return _helper(await recover_ECDH_256k1_KeyPair_ByMnemonicWord(words, password))
        },
    }
}
async function _helper(x: MnemonicGenerationInformation) {
    const {
        key: { privateKey, publicKey },
        mnemonicRecord: {
            parameter: { path, withPassword },
            words,
        },
        password,
    } = x
    return {
        mnemonic_words: words,
        parameter_path: path,
        parameter_with_password: withPassword,
        password,
        private: await CryptoKeyToJsonWebKey(privateKey),
        public: await CryptoKeyToJsonWebKey(publicKey),
    }
}

export default {
    ...WebCryptoMethods,
    ...initEllipticBackend(WebCryptoMethods),
}
