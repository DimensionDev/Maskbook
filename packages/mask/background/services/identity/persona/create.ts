import * as bip39 from 'bip39'
import { decodeArrayBuffer, encodeArrayBuffer } from '@masknet/kit'
import {
    type EC_Public_JsonWebKey,
    type PersonaIdentifier,
    isEC_Private_JsonWebKey,
    ECKeyIdentifier,
} from '@masknet/shared-base'
import { createPersonaByJsonWebKey } from '../../../database/persona/helper.js'
import { decode, encode } from '@msgpack/msgpack'
import { omit } from 'lodash-es'
import { queryPersonasDB } from '../../../database/persona/db.js'
import { deriveLocalKeyFromECDHKey, recover_ECDH_256k1_KeyPair_ByMnemonicWord } from './utils.js'

export async function createPersonaByPrivateKey(
    privateKeyString: string,
    nickname: string,
): Promise<PersonaIdentifier> {
    const privateKey = decode(decodeArrayBuffer(privateKeyString))
    if (!isEC_Private_JsonWebKey(privateKey)) throw new TypeError('Invalid private key')

    return createPersonaByJsonWebKey({ privateKey, publicKey: omit(privateKey, 'd') as EC_Public_JsonWebKey, nickname })
}

export async function createPersonaByMnemonicV2(
    mnemonicWord: string,
    nickname: string | undefined,
    password: string,
): Promise<PersonaIdentifier> {
    const personas = await queryPersonasDB({ nameContains: nickname })
    if (personas.length > 0) throw new Error('Nickname already exists')

    const verify = bip39.validateMnemonic(mnemonicWord)
    if (!verify) throw new Error('Verify error')

    const { key, mnemonicRecord: mnemonic } = await recover_ECDH_256k1_KeyPair_ByMnemonicWord(mnemonicWord, password)
    const { privateKey, publicKey } = key
    const localKey = await deriveLocalKeyFromECDHKey(publicKey, mnemonic.words)
    return createPersonaByJsonWebKey({
        privateKey,
        publicKey,
        localKey,
        mnemonic,
        nickname,
        uninitialized: false,
    })
}

export async function queryPersonaKeyByMnemonicV2(mnemonicWords: string) {
    const { key } = await recover_ECDH_256k1_KeyPair_ByMnemonicWord(mnemonicWords, '')
    const identifier = (await ECKeyIdentifier.fromJsonWebKey(key.publicKey)).unwrap()
    const encodePrivateKey = encode(key.privateKey)
    const privateKey = encodeArrayBuffer(encodePrivateKey)
    return {
        publicKey: identifier.toText(),
        privateKey,
    }
}
