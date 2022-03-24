import { ECKeyIdentifier, IdentifierMap, PostIVIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import { None } from 'ts-results'
import { BackupErrors } from '../BackupErrors'
import { isBackupVersion0, normalizeBackupVersion0 } from '../version-0'
import { isBackupVersion1, normalizeBackupVersion1 } from '../version-1'
import { generateBackupVersion2, isBackupVersion2, normalizeBackupVersion2 } from '../version-2'
import type { NormalizedBackup } from './type'

export * from './type'
function __normalizeBackup(data: unknown): NormalizedBackup.Data {
    if (isBackupVersion2(data)) return normalizeBackupVersion2(data)
    if (isBackupVersion1(data)) return normalizeBackupVersion1(data)
    if (isBackupVersion0(data)) return normalizeBackupVersion0(data)
    throw new TypeError(BackupErrors.UnknownFormat)
}

export function normalizeBackup(data: unknown): NormalizedBackup.Data {
    const normalized = __normalizeBackup(data)

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

export function generateBackupFile(data: NormalizedBackup.Data): unknown {
    const result = generateBackupRAW(data)
    return JSON.stringify(result)
}

export function createEmptyNormalizedBackup(): NormalizedBackup.Data {
    return {
        meta: { version: 2, createdAt: None, maskVersion: None },
        personas: new IdentifierMap(new Map(), ECKeyIdentifier),
        profiles: new IdentifierMap(new Map(), ProfileIdentifier),
        posts: new IdentifierMap(new Map(), PostIVIdentifier),
        relations: [],
        settings: { grantedHostPermissions: [] },
        wallets: [],
        plugins: {},
    }
}
