import { ProfileIdentifier } from '../../database/type'
import { BackupJSONFileLatest } from './BackupFormat/JSON/latest'
import { isBackupJSONFileVersion0 } from './BackupFormat/JSON/version-0'
import { isBackupJSONFileVersion1 } from './BackupFormat/JSON/version-1'

// Since 8/21/2019, every backup file of version 1 should have grantedHostPermissions
// Before 8/21/2019, we only support facebook, so we can auto upgrade the backup file
const facebookHost = ['https://m.facebook.com/*', 'https://www.facebook.com/*']
export function UpgradeBackupJSONFile(json: object, identity?: ProfileIdentifier): BackupJSONFileLatest | null {
    if (isBackupJSONFileVersion1(json)) {
        if (json.grantedHostPermissions === undefined) {
            json.grantedHostPermissions = facebookHost
            json.maskbookVersion = '1.5.2'
        }
        if (!json.maskbookVersion) json.maskbookVersion = '1.6.0'
        return json
    }
    if (isBackupJSONFileVersion0(json) && identity) {
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
