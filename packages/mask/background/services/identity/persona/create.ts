import * as bip39 from 'bip39'
import { decodeArrayBuffer } from '@dimensiondev/kit'
import {
    EC_Public_JsonWebKey,
    PersonaIdentifier,
    isEC_Private_JsonWebKey,
    ProfileIdentifier,
    AESJsonWebKey,
} from '@masknet/shared-base'
import { createPersonaByJsonWebKey } from '../../../database/persona/helper'
import { decode } from '@msgpack/msgpack'
import { omit } from 'lodash-unified'
import { personaRecordToMobilePersona } from './mobile'
import { attachProfileDB, LinkedProfileDetails, queryPersonaDB, queryPersonasDB } from '../../../database/persona/db'
import {
    deriveLocalKeyFromECDHKey,
    generate_ECDH_256k1_KeyPair_ByMnemonicWord,
    recover_ECDH_256k1_KeyPair_ByMnemonicWord,
} from './utils'
import type { MobilePersona } from '@masknet/public-api'

export async function createPersonaByPrivateKey(
    privateKeyString: string,
    nickname: string,
): Promise<PersonaIdentifier> {
    const privateKey = decode(decodeArrayBuffer(privateKeyString))
    if (!isEC_Private_JsonWebKey(privateKey)) throw new TypeError('Invalid private key')

    return createPersonaByJsonWebKey({ privateKey, publicKey: omit(privateKey, 'd') as EC_Public_JsonWebKey, nickname })
}

export async function mobile_restoreFromMnemonicWords(
    mnemonicWords: string,
    nickname: string,
    password: string,
): Promise<MobilePersona | null> {
    if (process.env.architecture !== 'app') throw new Error('This function is only available in mobile')
    if (!bip39.validateMnemonic(mnemonicWords)) throw new Error('the mnemonic words are not valid')
    const identifier = await restoreNewIdentityWithMnemonicWord(mnemonicWords, password, {
        nickname,
    })

    return queryPersonaDB(identifier).then((x) => personaRecordToMobilePersona(x))

    /**
     * Recover new identity by a password and mnemonic words
     *
     * @param password password used to generate mnemonic word, can be empty string
     * @param word mnemonic words
     * @param info additional information
     */
    async function restoreNewIdentityWithMnemonicWord(
        word: string,
        password: string,
        info: {
            whoAmI?: ProfileIdentifier
            nickname?: string
            localKey?: AESJsonWebKey
            details?: LinkedProfileDetails
        },
    ): Promise<PersonaIdentifier> {
        const { key, mnemonicRecord } = await recover_ECDH_256k1_KeyPair_ByMnemonicWord(word, password)
        const { privateKey, publicKey } = key
        const localKeyJwk = await deriveLocalKeyFromECDHKey(publicKey, mnemonicRecord.words)

        const ecKeyID = await createPersonaByJsonWebKey({
            publicKey,
            privateKey,
            localKey: info.localKey || localKeyJwk,
            mnemonic: mnemonicRecord,
            nickname: info.nickname,
        })
        if (info.whoAmI) {
            await attachProfileDB(info.whoAmI, ecKeyID, info.details || { connectionConfirmState: 'pending' })
        }
        return ecKeyID
    }
}

export async function createPersonaByMnemonic(
    nickname: string | undefined,
    password: string,
): Promise<PersonaIdentifier> {
    const { key, mnemonicRecord: mnemonic } = await generate_ECDH_256k1_KeyPair_ByMnemonicWord(password)
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
