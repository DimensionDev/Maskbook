import * as bip39 from 'bip39'
import * as wallet from 'wallet.ts'
import { encodeArrayBuffer } from '@dimensiondev/kit'
import type { PersonaRecord } from '../../../background/database/persona/db'
import {
    EC_Private_JsonWebKey,
    EC_Public_JsonWebKey,
    JsonWebKeyPair,
    toBase64URL,
    decompressSecp256k1Key,
} from '@masknet/shared-base'

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
    const jwk = decompressSecp256k1Key(encodeArrayBuffer(hdk.publicKey))
    jwk.d = hdk.privateKey ? toBase64URL(hdk.privateKey) : undefined
    return jwk
}

export async function split_ec_k256_keypair_into_pub_priv(
    key: Readonly<JsonWebKey>,
): Promise<JsonWebKeyPair<EC_Public_JsonWebKey, EC_Private_JsonWebKey>> {
    const { d, ...pub } = key
    if (!d) throw new TypeError('split_ec_k256_keypair_into_pub_priv requires a private key (jwk.d)')
    // TODO: maybe should do some extra check on properties
    // @ts-expect-error Do a force transform
    return { privateKey: { ...key }, publicKey: pub }
}
