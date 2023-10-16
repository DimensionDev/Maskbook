import * as bip39 from 'bip39'
import * as wallet from /* webpackDefer: true */ 'wallet.ts'
import { encodeArrayBuffer, encodeText } from '@masknet/kit'
import {
    type EC_Private_JsonWebKey,
    type EC_Public_JsonWebKey,
    type JsonWebKeyPair,
    toBase64URL,
    decompressK256Key,
    type AESCryptoKey,
    type AESJsonWebKey,
    isEC_Private_JsonWebKey,
} from '@masknet/shared-base'
import { CryptoKeyToJsonWebKey } from '../../../../utils-pure/index.js'
import type { PersonaRecord } from '../../../database/persona/db.js'

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

type MnemonicGenerationInformation = {
    key: JsonWebKeyPair<EC_Public_JsonWebKey, EC_Private_JsonWebKey>
    password: string
    mnemonicRecord: NonNullable<PersonaRecord['mnemonic']>
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
    const key = await split_ec_k256_key_pair_into_pub_priv(await HDKeyToJwk(derivedKey))
    return {
        key,
        password,
        mnemonicRecord: {
            parameter: { path, withPassword: password.length > 0 },
            words: mnemonicWord,
        },
    }
}

export async function validateMnemonic(mnemonic: string, wordList?: string[] | undefined): Promise<boolean> {
    return bip39.validateMnemonic(mnemonic, wordList)
}

async function HDKeyToJwk(hdk: wallet.HDKey): Promise<JsonWebKey> {
    const jwk = await decompressK256Key(encodeArrayBuffer(hdk.publicKey))
    jwk.d = hdk.privateKey ? toBase64URL(hdk.privateKey) : undefined
    return jwk
}

async function split_ec_k256_key_pair_into_pub_priv(
    key: Readonly<JsonWebKey>,
): Promise<JsonWebKeyPair<EC_Public_JsonWebKey, EC_Private_JsonWebKey>> {
    if (!isEC_Private_JsonWebKey(key)) throw new TypeError('Not a EC private key')
    const { d, ...pub } = key
    // @ts-expect-error Do a force transform
    return { privateKey: { ...key }, publicKey: pub }
}
