import * as bip39 from 'bip39'
import * as wallet from 'wallet.ts'
import { encodeArrayBuffer, encodeText } from '@dimensiondev/kit'
import {
    EC_Private_JsonWebKey,
    EC_Public_JsonWebKey,
    JsonWebKeyPair,
    toBase64URL,
    decompressSecp256k1Key,
    AESCryptoKey,
    AESJsonWebKey,
    assertEC_Private_JsonWebKey,
} from '@masknet/shared-base'
import { CryptoKeyToJsonWebKey } from '../../../../utils-pure'
import type { PersonaRecord } from '../../../database/persona/db'

/**
 * Local key (AES key) is used to encrypt message to myself.
 * This key should never be published.
 */

export async function deriveLocalKeyFromECDHKey(
    pub: EC_Public_JsonWebKey,
    mnemonicWord: string,
): Promise<AESJsonWebKey> {
    // ? Derive method: publicKey as "password" and password for the mnemonicWord as hash
    const pbkdf2 = await crypto.subtle.importKey('raw', encodeText(pub.x! + pub.y!), 'PBKDF2', false, [
        'deriveBits',
        'deriveKey',
    ])
    const aes = await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: encodeText(mnemonicWord), iterations: 100000, hash: 'SHA-256' },
        pbkdf2,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt'],
    )
    return CryptoKeyToJsonWebKey(aes as AESCryptoKey)
}

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
    const key = await split_ec_k256_keypair_into_pub_priv(await HDKeyToJwk(derivedKey))
    return {
        key,
        password,
        mnemonicRecord: {
            parameter: { path, withPassword: password.length > 0 },
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
    const key = await split_ec_k256_keypair_into_pub_priv(await HDKeyToJwk(derivedKey))
    return {
        key,
        password,
        mnemonicRecord: {
            parameter: { path, withPassword: password.length > 0 },
            words: mnemonicWord,
        },
    }
}

export const validateMnemonic = bip39.validateMnemonic

async function HDKeyToJwk(hdk: wallet.HDKey): Promise<JsonWebKey> {
    const jwk = await decompressSecp256k1Key(encodeArrayBuffer(hdk.publicKey))
    jwk.d = hdk.privateKey ? toBase64URL(hdk.privateKey) : undefined
    return jwk
}

async function split_ec_k256_keypair_into_pub_priv(
    key: Readonly<JsonWebKey>,
): Promise<JsonWebKeyPair<EC_Public_JsonWebKey, EC_Private_JsonWebKey>> {
    assertEC_Private_JsonWebKey(key)
    const { d, ...pub } = key
    // @ts-expect-error Do a force transform
    return { privateKey: { ...key }, publicKey: pub }
}
