import type { BackupJSONFileLatest } from './BackupFormat/JSON/latest'

export function fixBackupFilePermission(backup: BackupJSONFileLatest): BackupJSONFileLatest
export function fixBackupFilePermission(backup: null | BackupJSONFileLatest): BackupJSONFileLatest | null
export function fixBackupFilePermission(backup: null | BackupJSONFileLatest): BackupJSONFileLatest | null {
    if (!backup) return null
    return {
        ...backup,
        grantedHostPermissions: backup.grantedHostPermissions.filter((url) => /^(http|<all_urls>)/.test(url)),
    }
}

export function convertBackupFileToObject(short: string): BackupJSONFileLatest {
    const compressed = JSON.parse(short)
    // TODO: maybe schema validate?
    if (typeof compressed !== 'object') throw new TypeError('Invalid backup')
    return compressed
}
