import type { BackupJSONFileLatest } from './BackupFormat/JSON/latest'

function sanitizeBackupFile(backup: BackupJSONFileLatest): BackupJSONFileLatest {
    return {
        ...backup,
        grantedHostPermissions: backup.grantedHostPermissions.filter((url) => /^(http|<all_urls>)/.test(url)),
    }
}

export function decompressBackupFile(short: string): BackupJSONFileLatest {
    const compressed = JSON.parse(short)
    // TODO: maybe schema validate?
    if (typeof compressed !== 'object') throw new TypeError('Invalid backup')
    return sanitizeBackupFile(compressed)
}
