import { ProfileIdentifier } from '../../database/type'

// Since 8/21/2019, every backup file of version 1 should have grantedHostPermissions
// Before 8/21/2019, we only support facebook, so we can auto upgrade the backup file
const facebookHost = ['https://m.facebook.com/*', 'https://www.facebook.com/*']
export function UpgradeBackupJSONFile(json: object, identity?: ProfileIdentifier): BackupJSONFileLatest | null {
    if (isVersion1(json)) {
        if (json.grantedHostPermissions === undefined) {
            json.grantedHostPermissions = facebookHost
            json.maskbookVersion = '1.5.2'
        }
        if (!json.maskbookVersion) json.maskbookVersion = '1.6.0'
        return json
    }
    if (isVersion0(json) && identity) {
        return {
            maskbookVersion: '1.3.2',
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
            grantedHostPermissions: facebookHost,
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
        algor: unknown
        usages: string[]
    }
    local: JsonWebKey
}
// eslint-disable-next-line import/no-deprecated
function isVersion0(obj: object): obj is BackupJSONFileVersion0 {
    // eslint-disable-next-line import/no-deprecated
    const data: BackupJSONFileVersion0 = obj as any
    if (!data.local || !data.key || !data.key.key || !data.key.key.privateKey || !data.key.key.publicKey) return false
    return true
}
