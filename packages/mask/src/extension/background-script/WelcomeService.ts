import { encodeText } from '@dimensiondev/kit'
import type { DashboardRoutes, PersonaIdentifier, ProfileIdentifier, AESJsonWebKey } from '@masknet/shared-base'
import { recover_ECDH_256k1_KeyPair_ByMnemonicWord } from '../../utils/mnemonic-code'
import { createPersonaByJsonWebKey } from '../../../background/database/persona/helper'
import { attachProfileDB, LinkedProfileDetails } from '../../../background/database/persona/db'
import { deriveLocalKeyFromECDHKey } from '../../utils/mnemonic-code/localKeyGenerate'
import { saveFileFromBuffer } from '../../../shared'

import { assertEnvironment, Environment } from '@dimensiondev/holoflows-kit'
import formatDateTime from 'date-fns/format'
import './legacy'

export {
    mobile_generateBackupJSON,
    mobile_generateBackupJSONOnlyForPersona,
    generateBackupPreviewInfo,
    createBackupFile,
} from '../../../background/services/backup/create'
export {
    restoreBackup,
    parseBackupStr,
    getUnconfirmedBackup,
    restoreBackupWithID,
    restoreBackupWithIDAndPermission,
    restoreBackupWithIDAndPermissionAndWallet,
} from '../../../background/services/backup/restore'

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
    saveFileFromBuffer(buffer, mimeType, fileName)
    return obj
}

export async function downloadBackupV2(buffer: ArrayBuffer) {
    saveFileFromBuffer(buffer, 'application/octet-stream', makeBackupName('bin'))
}

async function createBackupInfo<T>(obj: T, type?: 'txt' | 'json') {
    const string = typeof obj === 'string' ? obj : JSON.stringify(obj)
    const buffer = encodeText(string)
    const mimeType = type === 'txt' ? 'text/plain' : 'application/json'
    return { buffer, mimeType, fileName: makeBackupName(type ?? 'json') }
}

export async function openOptionsPage(route?: DashboardRoutes, search?: string) {
    return browser.tabs.create({
        active: true,
        url: browser.runtime.getURL(`/dashboard.html#${route}${search ? `?${search}` : ''}`),
    })
}

export { createPersonaByMnemonic } from '../../database'

function makeBackupName(extension: string) {
    const now = formatDateTime(Date.now(), 'yyyy-MM-dd')
    return `mask-network-keystore-backup-${now}.${extension}`
}
