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
import type { MnemonicWordDetail } from '../interfaces/interface.blockchain'

if (process.env.NODE_ENV !== 'test' && !process.env.STORYBOOK) {
    import('webcrypto-liner')
}

const ECDH = getKeyParameter('ecdh')[0]
const ECDSA = getKeyParameter('ecdsa')[0]
function initEllipticBackend(_: WebCryptoSupportedMethods): WebCryptoNotSupportedMethods {
    return {
        async generate_ec_k256_pair() {
            const { privateKey, publicKey } = await crypto.subtle.generateKey(
                { name: 'ECDH', namedCurve: 'K-256' },
                true,
                [...ECDH],
            )
            return {
                privateKey: await CryptoKeyToJsonWebKey(privateKey!),
                publicKey: await CryptoKeyToJsonWebKey(publicKey!),
            }
        },
        async derive_aes_from_ecdh_k256(priv, pub, aes = 'AES-GCM', length = 256) {
            const key = await crypto.subtle.deriveKey(
                { name: 'ECDH', public: await JsonWebKeyToCryptoKey(pub, ...getKeyParameter('ecdh')) },
                await JsonWebKeyToCryptoKey(priv, ...getKeyParameter('ecdh')),
                { name: aes, length },
                true,
                ['encrypt', 'decrypt'],
            )
            return CryptoKeyToJsonWebKey(key)
        },
        async generate_ecdh_k256_from_mnemonic(password) {
            return _helper(await generate_ECDH_256k1_KeyPair_ByMnemonicWord(password))
        },
        async recover_ecdh_k256_from_mnemonic(words, password) {
            return _helper(await recover_ECDH_256k1_KeyPair_ByMnemonicWord(words, password))
        },
    }
}
async function _helper(x: MnemonicGenerationInformation): Promise<MnemonicWordDetail> {
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
        privateKey,
        publicKey,
    }
}

export default {
    ...WebCryptoMethods,
    ...initEllipticBackend(WebCryptoMethods),
}
