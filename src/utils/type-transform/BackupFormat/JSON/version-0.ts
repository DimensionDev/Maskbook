/**
 * @deprecated History JSON backup file
 */
export interface BackupJSONFileVersion0 {
    key: {
        username: string
        key: { publicKey: JsonWebKey; privateKey?: JsonWebKey }
        algor: unknown
        usages: string[]
    }
    local: JsonWebKey
}
// eslint-disable-next-line import/no-deprecated
export function isBackupJSONFileVersion0(obj: object): obj is BackupJSONFileVersion0 {
    // eslint-disable-next-line import/no-deprecated
    const data: BackupJSONFileVersion0 = obj as any
    if (!data.local || !data.key || !data.key.key || !data.key.key.privateKey || !data.key.key.publicKey) return false
    return true
}
