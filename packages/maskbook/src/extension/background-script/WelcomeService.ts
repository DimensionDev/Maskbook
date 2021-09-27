import { encodeText } from '@dimensiondev/kit'
import { delay } from '../../utils/utils'
import { recover_ECDH_256k1_KeyPair_ByMnemonicWord } from '../../utils/mnemonic-code'
import { createPersonaByJsonWebKey } from '../../database'
import { attachProfileDB, LinkedProfileDetails } from '../../database/Persona/Persona.db'
import { deriveLocalKeyFromECDHKey } from '../../utils/mnemonic-code/localKeyGenerate'
import type { PersonaIdentifier, ProfileIdentifier } from '../../database/type'
import { BackupOptions, generateBackupJSON } from './WelcomeServices/generateBackupJSON'
import type { AESJsonWebKey } from '../../modules/CryptoAlgorithm/interfaces/utils'
import { requestBrowserPermission, saveAsFileFromBuffer } from './HelperService'
import type { DashboardRoute } from '../options-page/Route'
import {
    BackupJSONFileLatest,
    getBackupPreviewInfo,
    UpgradeBackupJSONFile,
} from '../../utils/type-transform/BackupFormat/JSON/latest'

import { assertEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { decompressBackupFile, extraPermissions } from '../../utils'
import { v4 as uuid } from 'uuid'
import { getUnconfirmedBackup, restoreBackup, setUnconfirmedBackup } from './WelcomeServices/restoreBackup'

export { generateBackupJSON, generateBackupPreviewInfo } from './WelcomeServices/generateBackupJSON'
export * from './WelcomeServices/restoreBackup'
assertEnvironment(Environment.ManifestBackground)

/**
 * Recover new identity by a password and mnemonic words
 *
 * @param password password used to generate mnemonic word, can be empty string
 * @param word mnemonic words
 * @param info additional information
 */
export async function restoreNewIdentityWithMnemonicWord(
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

export async function downloadBackup<T>(obj: T, type?: 'txt' | 'json') {
    const { buffer, mimeType, fileName } = await createBackupInfo(obj, type)
    saveAsFileFromBuffer(buffer, mimeType, fileName)
    return obj
}

export async function downloadBackupV2(buffer: ArrayBuffer) {
    const date = new Date()
    const today = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
        .getDate()
        .toString()
        .padStart(2, '0')}`
    const fileName = `mask-network-keystore-backup-${today}.bin`

    saveAsFileFromBuffer(buffer, 'application/octet-stream', fileName)
}

export async function createBackupFile(
    options: { download: boolean; onlyBackupWhoAmI: boolean } & Partial<BackupOptions>,
): Promise<BackupJSONFileLatest> {
    const obj = await generateBackupJSON(options)
    if (!options.download) return obj
    // Don't make the download pop so fast
    await delay(1000)
    return downloadBackup(obj)
}

export async function createBackupUrl(
    options: { download: boolean; onlyBackupWhoAmI: boolean } & Partial<BackupOptions>,
) {
    const obj = await generateBackupJSON(options)
    const { buffer, mimeType, fileName } = await createBackupInfo(obj)
    const blob = new Blob([buffer], { type: mimeType })
    const url = URL.createObjectURL(blob)
    return { url, fileName }
}

async function createBackupInfo<T>(obj: T, type?: 'txt' | 'json') {
    const string = typeof obj === 'string' ? obj : JSON.stringify(obj)
    const buffer = encodeText(string)
    const date = new Date()
    const today = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
        .getDate()
        .toString()
        .padStart(2, '0')}`
    const fileName = `mask-network-keystore-backup-${today}.${type ?? 'json'}`
    const mimeType = type === 'txt' ? 'text/plain' : 'application/json'
    return { buffer, mimeType, fileName }
}

export async function openOptionsPage(route?: DashboardRoute, search?: string) {
    return browser.tabs.create({
        active: true,
        url: browser.runtime.getURL(route ? `/index.html#${route}${search ? `?${search}` : ''}` : '/index.html'),
    })
}

export { createPersonaByMnemonic } from '../../database'

export function parseBackupStr(str: string) {
    const json = UpgradeBackupJSONFile(decompressBackupFile(str))
    if (json) {
        const info = getBackupPreviewInfo(json)
        const id = uuid()
        setUnconfirmedBackup(id, json)
        return { info, id }
    } else {
        return null
    }
}

export async function checkPermissionsAndRestore(id: string) {
    const json = await getUnconfirmedBackup(id)
    if (json) {
        const permissions = await extraPermissions(json.grantedHostPermissions)
        if (permissions.length) {
            const granted = await requestBrowserPermission({origins: permissions})
            if (!granted) return
        }

        await restoreBackup(json)
    }
}

// permissions
export function queryPermission(permission: browser.permissions.Permissions) {
    return browser.permissions.contains(permission)
}
