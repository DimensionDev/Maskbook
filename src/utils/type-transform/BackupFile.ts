import { PersonIdentifier, GroupType } from '../../database/type'

export function UpgradeBackupJSONFile(json: object, identity?: PersonIdentifier): BackupJSONFileLatest | null {
    if (isVersion1(json)) return json
    if (isVersion0(json) && identity) {
        return {
            version: 1,
            whoami: [
                {
                    localKey: json.local,
                    network: 'facebook.com',
                    publicKey: json.key.key.publicKey,
                    privateKey: json.key.key.privateKey!,
                    userId: identity.userId || '$self',
                },
            ],
        }
    }
    return null
}

/**
 * Always use this interface in other code.
 */
export interface BackupJSONFileLatest extends BackupJSONFileVersion1 {}
/**
 * Latest JSON backup format
 */
export interface BackupJSONFileVersion1 {
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
        groups?: { network: string; groupId: string; type: GroupType }[]
    }>
}
function isVersion1(obj: object): obj is BackupJSONFileVersion1 {
    const data: BackupJSONFileVersion1 = obj as any
    if (data.version !== 1) return false
    if (!Array.isArray(data.whoami)) return false
    if (!data.whoami) return false
    return true
}
/**
 * @deprecated History JSON backup file
 */
export interface BackupJSONFileVersion0 {
    key: {
        username: string
        key: { publicKey: JsonWebKey; privateKey?: JsonWebKey }
        algor: any
        usages: string[]
    }
    local: JsonWebKey
}
// tslint:disable-next-line: deprecation
function isVersion0(obj: object): obj is BackupJSONFileVersion0 {
    // tslint:disable-next-line: deprecation
    const data: BackupJSONFileVersion0 = obj as any
    if (!data.local || !data.key || !data.key.key || !data.key.key.privateKey || !data.key.key.publicKey) return false
    return true
}
