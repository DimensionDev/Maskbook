import { None } from 'ts-results-es'
import { BackupErrors } from '../BackupErrors.js'
import { isBackupVersion0, normalizeBackupVersion0 } from '../version-0/index.js'
import { isBackupVersion1, normalizeBackupVersion1 } from '../version-1/index.js'
import { generateBackupVersion2, isBackupVersion2, normalizeBackupVersion2 } from '../version-2/index.js'
import type { NormalizedBackup } from './type.js'

export type * from './type.js'
async function __normalizeBackup(data: unknown): Promise<NormalizedBackup.Data> {
    if (isBackupVersion2(data)) return normalizeBackupVersion2(data)
    if (isBackupVersion1(data)) return normalizeBackupVersion1(data)
    if (isBackupVersion0(data)) return normalizeBackupVersion0(data)
    throw new TypeError(BackupErrors.UnknownFormat)
}

export async function normalizeBackup(data: unknown): Promise<NormalizedBackup.Data> {
    const normalized = await __normalizeBackup(data)

    // fix invalid URL
    normalized.settings.grantedHostPermissions = normalized.settings.grantedHostPermissions.filter((url) =>
        /^(http|<all_urls>)/.test(url),
    )
    return normalized
}

/** It will return the internal format. DO NOT rely on the detail of it! */
export function generateBackupRAW(data: NormalizedBackup.Data): unknown {
    const result = generateBackupVersion2(data)
    return result
}

export function createEmptyNormalizedBackup(): NormalizedBackup.Data {
    return {
        meta: { version: 2, createdAt: None, maskVersion: None },
        personas: new Map(),
        profiles: new Map(),
        posts: new Map(),
        relations: [],
        settings: { grantedHostPermissions: [] },
        wallets: [],
        plugins: {},
    }
}
