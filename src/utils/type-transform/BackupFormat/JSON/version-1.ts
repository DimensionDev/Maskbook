/* eslint-disable import/no-deprecated */
import type { BackupJSONFileVersion0 } from './version-0'
import type { ProfileIdentifier } from '../../../../database/type'
import type {
    EC_Public_JsonWebKey,
    EC_Private_JsonWebKey,
    AESJsonWebKey,
} from '../../../../modules/CryptoAlgorithm/interfaces/utils'

/**
 * @deprecated The old version 1 backup file before persona db was done.
 */
export interface BackupJSONFileVersion1 {
    maskbookVersion: string
    version: 1
    whoami: Array<{
        network: string
        userId: string
        publicKey: EC_Public_JsonWebKey
        privateKey: EC_Private_JsonWebKey
        localKey: AESJsonWebKey
        previousIdentifiers?: { network: string; userId: string }[]
        nickname?: string
    }>
    people?: Array<{
        network: string
        userId: string
        publicKey: EC_Public_JsonWebKey
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

// Since 8/21/2019, every backup file of version 1 should have grantedHostPermissions
// Before 8/21/2019, we only support facebook, so we can auto upgrade the backup file
const facebookHost = ['https://m.facebook.com/*', 'https://www.facebook.com/*']
export function patchNonBreakingUpgradeForBackupJSONFileVersion1(json: BackupJSONFileVersion1): BackupJSONFileVersion1 {
    if (json.grantedHostPermissions === undefined) {
        json.grantedHostPermissions = facebookHost
        json.maskbookVersion = '1.5.2'
    }
    if (!json.maskbookVersion) json.maskbookVersion = '1.6.0'
    return json
}
export function upgradeFromBackupJSONFileVersion0(
    json: BackupJSONFileVersion0,
    identity: ProfileIdentifier,
): BackupJSONFileVersion1 | null {
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
