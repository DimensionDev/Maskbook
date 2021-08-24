import { decodeText, encodeText } from '@dimensiondev/kit'
import { PLUGIN_IDENTIFIER, WalletMessages } from '@masknet/plugin-wallet'
import { Err, None, Ok, Option, Result, Some } from 'ts-results'
import { createPluginDatabase } from '../../../database/Plugin/wrap-plugin-database'
import { startEffect } from '../../../utils'
import type { EncryptedWallet, EncryptedWalletPrimaryKey } from './types'
type WalletRecordEncrypted = unknown

let primaryKey: null | CryptoKey = null
let decrypted: WalletRecordEncrypted = null
const EncryptedDB = createPluginDatabase<EncryptedWallet | EncryptedWalletPrimaryKey>(PLUGIN_IDENTIFIER)

export enum DecryptWalletError {
    EncryptedStoreNotExist = 1,
    PasswordError = 2,
}
export enum UpdateWalletError {
    EncryptedStoreNotExist = 1,
    EncryptedStoreLocked = 2,
}
import.meta.webpackHot && import.meta.webpackHot.accept()
startEffect(import.meta.webpackHot, () => {
    // lock wallet after 15 mins
    const timeout = setTimeout(lockWallet, 1000 * 60 * 15)
    return () => {
        lockWallet()
        clearTimeout(timeout)
    }
})
/** Detect if there is an encrypted wallet store. If there is, we should use the encrypted store. */
export function hasEncryptedWalletStore(): Promise<boolean> {
    return EncryptedDB.has('primary-key', 'wallet')
}
/** Verify and decrypt the wallet database. If the password is correct, it will return true. */
export async function decryptWallet(passwordCandidate: string): Promise<Result<void, DecryptWalletError>> {
    const encryptedWallets = await EncryptedDB.get('wallet', 'wallet')
    const primaryRecord = await EncryptedDB.get('primary-key', 'wallet')
    if (!encryptedWallets || !primaryRecord) return Err(DecryptWalletError.EncryptedStoreNotExist)

    const pbkdf2 = await derivePBKDF2(passwordCandidate)
    const aes = await deriveAES_KW(pbkdf2, primaryRecord.iv)
    primaryKey = await unwrapKey(primaryRecord.wrappedKey, aes).catch(() => null)
    if (!primaryKey) return Err(DecryptWalletError.PasswordError)

    const json = await decrypt(encryptedWallets.encrypted, primaryKey, encryptedWallets.iv)

    // broken store is a fatal error and should not happen
    decrypted = JSON.parse(decodeText(json))
    WalletMessages.events.walletLockStatusUpdated.sendToAll(false)
    return Ok(undefined)
}
export async function lockWallet() {
    primaryKey = null
    decrypted = null
    WalletMessages.events.walletLockStatusUpdated.sendToAll(true)
}

export async function updateWalletStore(newStore: WalletRecordEncrypted): Promise<Result<void, UpdateWalletError>> {
    if (!(await hasEncryptedWalletStore())) return Err(UpdateWalletError.EncryptedStoreNotExist)
    if (!primaryKey) return Err(UpdateWalletError.EncryptedStoreLocked)
    await writeStore(newStore, primaryKey)
    decrypted = newStore
    return Ok(undefined)
}

export async function createEncryptedWalletStore(password: string, force = false) {
    if (await hasEncryptedWalletStore()) {
        if (!force) throw new Error('Store exists. Please use "force" to overwrite.')
    }
    const pbkdf2 = await derivePBKDF2(password)
    const iv = getIV()
    const aesKW = await deriveAES_KW(pbkdf2, iv)
    const pendingPrimaryKey = await createAES()
    const wrappedKey = await wrapKey(pendingPrimaryKey, aesKW)
    try {
        await EncryptedDB.add({ type: 'primary-key', id: 'wallet', iv, wrappedKey })
        const empty: WalletRecordEncrypted = {}
        await writeStore(empty, pendingPrimaryKey)
        primaryKey = pendingPrimaryKey
        decrypted = empty
    } catch (error) {
        await EncryptedDB.remove('primary-key', 'wallet')
        throw error
    }
}

export async function getEncryptedWalletStore(): Promise<Option<WalletRecordEncrypted>> {
    if (decrypted) return Some(decrypted)
    return None
}

async function writeStore(data: WalletRecordEncrypted, primaryKey: CryptoKey) {
    const store = encodeText(JSON.stringify(data)).buffer
    const iv = getIV()
    const encrypted = await encrypt(store, primaryKey, iv)
    await EncryptedDB.add({ type: 'wallet', id: 'wallet', encrypted, iv })
}
function derivePBKDF2(password: string) {
    return crypto.subtle.importKey('raw', encodeText(password), 'PBKDF2', false, ['deriveBits', 'deriveKey'])
}
function deriveAES_KW(key: CryptoKey, iv: ArrayBuffer) {
    return crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt: iv,
            iterations: 100000,
            hash: 'SHA-256',
        },
        key,
        { name: 'AES-KW', length: 256 },
        false,
        ['wrapKey', 'unwrapKey'],
    )
}
function createAES() {
    return crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
}
function wrapKey(key: CryptoKey, wrapKey: CryptoKey) {
    return crypto.subtle.wrapKey('raw', key, wrapKey, 'AES-KW')
}
function unwrapKey(key: ArrayBuffer, wrapKey: CryptoKey) {
    return crypto.subtle.unwrapKey('raw', key, wrapKey, 'AES-KW', 'AES-GCM', false, ['encrypt', 'decrypt'])
}
function encrypt(message: ArrayBuffer, key: CryptoKey, iv: ArrayBuffer) {
    return crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, message)
}
function decrypt(message: ArrayBuffer, key: CryptoKey, iv: ArrayBuffer) {
    return crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, message)
}
function getIV() {
    return crypto.getRandomValues(new Uint8Array(16))
}
