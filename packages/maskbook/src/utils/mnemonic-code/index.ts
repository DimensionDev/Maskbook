import * as bip39 from 'bip39'
import * as wallet from 'wallet.ts'
import { decompressSecp256k1Key } from '../type-transform/SECP256k1-Compression'
import { Convert } from 'pvtsutils'
import { encodeArrayBuffer } from '../type-transform/String-ArrayBuffer'
import type { PersonaRecord } from '../../database/Persona/Persona.db'
import type {
    EC_Private_JsonWebKey,
    EC_Public_JsonWebKey,
    JsonWebKeyPair,
} from '../../modules/CryptoAlgorithm/interfaces/utils'
import { split_ec_k256_keypair_into_pub_priv } from '../../modules/CryptoAlgorithm/helper'

// Private key at m/44'/coinType'/account'/change/addressIndex
// coinType = ether
const path = "m/44'/60'/0'/0/0"

export type MnemonicGenerationInformation = {
    key: JsonWebKeyPair<EC_Public_JsonWebKey, EC_Private_JsonWebKey>
    password: string
    mnemonicRecord: NonNullable<PersonaRecord['mnemonic']>
}
export async function generate_ECDH_256k1_KeyPair_ByMnemonicWord(
    password: string,
): Promise<MnemonicGenerationInformation> {
    const mnemonicWord = bip39.generateMnemonic()
    const seed = await bip39.mnemonicToSeed(mnemonicWord, password)
    const masterKey = wallet.HDKey.parseMasterSeed(seed)
    const derivedKey = masterKey.derive(path)
    const key = await split_ec_k256_keypair_into_pub_priv(HDKeyToJwk(derivedKey))
    return {
        key,
        password,
        mnemonicRecord: {
            parameter: { path: path, withPassword: password.length > 0 },
            words: mnemonicWord,
        },
    }
}

export async function generate_ECDH_256k1_KeyPair_ByMnemonicWord_V2(
    mnemonicWord: string,
    password: string,
): Promise<MnemonicGenerationInformation> {
    const verify = bip39.validateMnemonic(mnemonicWord)
    if (!verify) {
        throw new Error('Verify error')
    }
    const seed = await bip39.mnemonicToSeed(mnemonicWord, password)
    const masterKey = wallet.HDKey.parseMasterSeed(seed)
    const derivedKey = masterKey.derive(path)
    const key = await split_ec_k256_keypair_into_pub_priv(HDKeyToJwk(derivedKey))
    return {
        key,
        password,
        mnemonicRecord: {
            parameter: { path: path, withPassword: password.length > 0 },
            words: mnemonicWord,
        },
    }
}

export async function recover_ECDH_256k1_KeyPair_ByMnemonicWord(
    mnemonicWord: string,
    password: string,
): Promise<MnemonicGenerationInformation> {
    const verify = bip39.validateMnemonic(mnemonicWord)
    if (!verify) {
        console.warn('Verify error')
    }
    const seed = await bip39.mnemonicToSeed(mnemonicWord, password)
    const masterKey = wallet.HDKey.parseMasterSeed(seed)
    const derivedKey = masterKey.derive(path)
    const key = await split_ec_k256_keypair_into_pub_priv(HDKeyToJwk(derivedKey))
    return {
        key,
        password,
        mnemonicRecord: {
            parameter: { path: path, withPassword: password.length > 0 },
            words: mnemonicWord,
        },
    }
}

export const validateMnemonic = bip39.validateMnemonic

function HDKeyToJwk(hdk: wallet.HDKey): JsonWebKey {
    const jwk = decompressSecp256k1Key(encodeArrayBuffer(hdk.publicKey), 'public')
    jwk.d = hdk.privateKey ? Convert.ToBase64Url(hdk.privateKey) : undefined
    return jwk
}
