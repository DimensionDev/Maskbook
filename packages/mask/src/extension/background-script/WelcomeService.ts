import { encodeText } from '@dimensiondev/kit'
import type { DashboardRoutes } from '@masknet/shared-base'
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
    addUnconfirmedBackup,
    getUnconfirmedBackup,
    restoreUnconfirmedBackup,
    mobile_restoreFromBase64,
} from '../../../background/services/backup/restore'

assertEnvironment(Environment.ManifestBackground)

export async function downloadBackup(obj: unknown, type?: 'txt' | 'json'): Promise<void> {
    const { buffer, mimeType, fileName } = await createBackupInfo(obj, type)
    saveFileFromBuffer(buffer, mimeType, fileName)
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
