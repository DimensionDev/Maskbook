/**
 * Latest JSON backup format
 */
export interface BackupJSONFileVersion1 {
    maskbookVersion: string
    version: 1
    whoami: Array<{
        network: string
        userId: string
        publicKey: JsonWebKey
        privateKey: JsonWebKey
        localKey: JsonWebKey
        previousIdentifiers?: { network: string; userId: string }[]
        nickname?: string
    }>
    people?: Array<{
        network: string
        userId: string
        publicKey: JsonWebKey
        previousIdentifiers?: { network: string; userId: string }[]
        nickname?: string
        groups?: { network: string; groupID: string; virtualGroupOwner: string | null }[]
    }>
    grantedHostPermissions: string[]
}
export function isBackupJSONFileVersion1(obj: object): obj is BackupJSONFileVersion1 {
    const data: BackupJSONFileVersion1 = obj as any
    if (data.version !== 1) return false
    if (!Array.isArray(data.whoami)) return false
    if (!data.whoami) return false
    return true
}
