import type { EC_Public_JsonWebKey, EC_Private_JsonWebKey, AESJsonWebKey } from '@masknet/shared-base'

/**
 * @deprecated History JSON backup file
 */
export interface BackupJSONFileVersion0 {
    key: {
        username: string
        key: { publicKey: EC_Public_JsonWebKey; privateKey?: EC_Private_JsonWebKey }
        algor: unknown
        usages: string[]
    }
    local: AESJsonWebKey
}
export function isBackupJSONFileVersion0(obj: object): obj is BackupJSONFileVersion0 {
    const data: BackupJSONFileVersion0 = obj as any
    if (!data.local || !data.key || !data.key.key || !data.key.key.privateKey || !data.key.key.publicKey) return false
    return true
}
