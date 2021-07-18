import { encodeText } from '@dimensiondev/kit'
import { delay } from '@masknet/shared'
import { recover_ECDH_256k1_KeyPair_ByMnemonicWord } from '../../utils/mnemonic-code'
import { createPersonaByJsonWebKey } from '../../database'
import { attachProfileDB, LinkedProfileDetails } from '../../database/Persona/Persona.db'
import { deriveLocalKeyFromECDHKey } from '../../utils/mnemonic-code/localKeyGenerate'
import type { ProfileIdentifier, PersonaIdentifier } from '@masknet/shared'
import { generateBackupJSON, BackupOptions } from './WelcomeServices/generateBackupJSON'
import type { AESJsonWebKey } from '@masknet/shared'
import { saveAsFileFromBuffer } from './HelperService'
import type { DashboardRoute } from '../options-page/Route'
export { generateBackupJSON, generateBackupPreviewInfo } from './WelcomeServices/generateBackupJSON'
export * from './WelcomeServices/restoreBackup'
import {
    BackupJSONFileLatest,
    decompressBackupFileForV3,
    getBackupPreviewInfo,
    UpgradeBackupJSONFileForV3,
} from '../../utils'

import { assertEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import { extraPermissions, requestPermissions } from '../../utils'
import { v4 as uuid } from 'uuid'
import { getUnconfirmedBackup, restoreBackup, setUnconfirmedBackup } from './WelcomeServices/restoreBackup'
assertEnvironment(Environment.ManifestBackground)

export type { BackupJSONFileLatest } from '../../utils'

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

export async function downloadBackup<T>(obj: T) {
    const { buffer, mimeType, fileName } = await createBackupInfo(obj)
    saveAsFileFromBuffer(buffer, mimeType, fileName)
    return obj
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

async function createBackupInfo<T>(obj: T) {
    const string = typeof obj === 'string' ? obj : JSON.stringify(obj)
    const buffer = encodeText(string)
    const date = new Date()
    const today = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
        .getDate()
        .toString()
        .padStart(2, '0')}`
    const fileName = `maskbook-keystore-backup-${today}.json`
    const mimeType = 'application/json'
    return { buffer, mimeType, fileName }
}

export async function openOptionsPage(route?: DashboardRoute, search?: string) {
    return browser.tabs.create({
        active: true,
        url: browser.runtime.getURL(route ? `/index.html#${route}${search ? `?${search}` : ''}` : '/index.html'),
    })
}

export { createPersonaByMnemonic } from '../../database'
export { decompressBackupFile, decompressBackupFileForV3 } from '../../utils'

export function parseBackupStr(str: string, identifier?: string) {
    const json = UpgradeBackupJSONFileForV3(decompressBackupFileForV3(str), undefined, identifier)
    if (json) {
        const info = getBackupPreviewInfo(json)
        const id = uuid()
        setUnconfirmedBackup(id, json as unknown as BackupJSONFileLatest)
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
            const granted = await requestPermissions(permissions)
            if (!granted) return
        }

        await restoreBackup(json)
    }
}

// permissions
export function queryPermission(permission: browser.permissions.Permissions) {
    return browser.permissions.contains(permission)
}
