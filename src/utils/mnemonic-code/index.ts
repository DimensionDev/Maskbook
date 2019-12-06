import * as bip39 from 'bip39'
import * as wallet from 'wallet.ts'
import { decompressSecp256k1Key } from '../type-transform/SECP256k1-Compression'
import { Convert } from 'pvtsutils'
import { import_ECDH_256k1_KeyPair } from '../crypto.subtle'
import { encodeArrayBuffer } from '../type-transform/String-ArrayBuffer'

// Private key at m/44'/coinType'/account'/change/addressIndex
// coinType = ether
export const generate_ECDH_256k1_KeyPair_ByMnemonicWord_Path = "m/44'/60'/0'/0/0"

export async function generate_ECDH_256k1_KeyPair_ByMnemonicWord(password: string) {
    const mnemonicWord = bip39.generateMnemonic()
    const seed = await bip39.mnemonicToSeed(mnemonicWord, password)
    const masterKey = wallet.HDKey.parseMasterSeed(seed)
    const derivedKey = masterKey.derive(generate_ECDH_256k1_KeyPair_ByMnemonicWord_Path)
    const key = await import_ECDH_256k1_KeyPair(HDKeyToJwk(derivedKey))
    return {
        key,
        password,
        mnemonicWord,
        mnemonicWordPassword: password,
        withPassword: password.length > 0,
    }
}

export async function recover_ECDH_256k1_KeyPair_ByMnemonicWord(mnemonicWord: string, password: string) {
    const verify = bip39.validateMnemonic(mnemonicWord)
    if (!verify) {
        console.warn('Verify error')
    }
    const seed = await bip39.mnemonicToSeed(mnemonicWord, password)
    const masterKey = wallet.HDKey.parseMasterSeed(seed)
    const derivedKey = masterKey.derive(generate_ECDH_256k1_KeyPair_ByMnemonicWord_Path)
    const key = await import_ECDH_256k1_KeyPair(HDKeyToJwk(derivedKey))
    return {
        key,
        password,
        mnemonicWord,
        mnemonicWordPassword: password,
        withPassword: password.length > 0,
    }
}

function HDKeyToJwk(hdk: wallet.HDKey): JsonWebKey {
    const jwk = decompressSecp256k1Key(encodeArrayBuffer(hdk.publicKey), 'public')
    jwk.d = hdk.privateKey ? Convert.ToBase64Url(hdk.privateKey) : undefined
    return jwk
}
