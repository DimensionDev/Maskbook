import ZSchema from 'z-schema'
import KeyStoreSchema from './schema.json'
import { sha3 } from 'web3-utils'
import type { CryptoKeyStore, KeyStore } from './types'

export function loadKeyStore(input: string): KeyStore {
    let store: object
    try {
        store = JSON.parse(input)
    } catch {
        throw new Error('JSON file is incorrect')
    }
    const validator = new ZSchema({
        strictMode: true,
        breakOnFirstError: true,
    })
    validator.validate(input, KeyStoreSchema)
    return store as KeyStore
}

export function assertKeyDerivation(keystore: CryptoKeyStore, derivedKey: Uint8Array) {
    const payload = Buffer.concat([derivedKey.slice(16, 32), Buffer.from(keystore.ciphertext, 'hex')])
    const valid = sha3(`0x${payload.toString('hex')}`) === `0x${keystore.mac}`
    if (!valid) {
        throw new Error('Password is incorrect')
    }
}
