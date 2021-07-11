import type { AESJsonWebKey, EC_Private_JsonWebKey, EC_Public_JsonWebKey, IdentityIdentifier } from '@masknet/shared'
import { recover_ECDH_256k1_KeyPair_ByMnemonicWord } from '../../utils/mnemonic-code'
import { deriveLocalKeyFromECDHKey } from '../../utils/mnemonic-code/localKeyGenerate'
import { ECKeyIdentifierFromJsonWebKey } from '../type'
import type { IdentityRecord } from './Identity.db'
import { createIdentityInDB, queryIdentity } from './Identity.db'

export async function createIdentityByMnemonic(mnemonicWord: string, password: string) {
    // todo: replace recover_ECDH_256k1_KeyPair_ByMnemonicWord
    const { key, mnemonicRecord: mnemonic } = await recover_ECDH_256k1_KeyPair_ByMnemonicWord(mnemonicWord, password)
    const { privateKey, publicKey } = key
    const localKey = await deriveLocalKeyFromECDHKey(publicKey, mnemonic.words)
    return createIdentityByJsonWebKey({
        privateKey,
        publicKey,
        localKey,
        mnemonic,
    })
}

export async function recoverIdentityByMnemonic(mnemonicWord: string, password: string) {
    // todo: replace recover_ECDH_256k1_KeyPair_ByMnemonicWord
    const { key } = await recover_ECDH_256k1_KeyPair_ByMnemonicWord(mnemonicWord, password)
    const { publicKey } = key
    const identifier = ECKeyIdentifierFromJsonWebKey(publicKey)
    return queryIdentity(identifier.toText())
}

export async function createIdentityByJsonWebKey(options: {
    publicKey: EC_Public_JsonWebKey
    privateKey: EC_Private_JsonWebKey
    localKey?: AESJsonWebKey
    mnemonic?: IdentityRecord['mnemonic']
}): Promise<IdentityIdentifier> {
    const identifier = ECKeyIdentifierFromJsonWebKey(options.publicKey)
    const record: IdentityRecord = {
        createdAt: new Date(),
        updatedAt: new Date(),
        identifier: identifier,
        publicKey: options.publicKey,
        privateKey: options.privateKey,
        mnemonic: options.mnemonic,
        localKey: options.localKey,
        uninitialized: true,
    }
    await createIdentityInDB(record)
    return identifier
}

export async function queryIdentityByKey(key: string) {
    return queryIdentity(key)
}
