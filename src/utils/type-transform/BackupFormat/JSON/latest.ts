/* eslint-disable import/no-deprecated */
import {
    BackupJSONFileVersion1,
    isBackupJSONFileVersion1,
    patchNonBreakingUpgradeForBackupJSONFileVersion1,
    upgradeFromBackupJSONFileVersion0,
} from './version-1'
import { ProfileIdentifier } from '../../../../database/type'
import { isBackupJSONFileVersion0 } from './version-0'

/**
 * Always use this interface in other code.
 */
export interface BackupJSONFileLatest extends BackupJSONFileVersion1 {}
export function UpgradeBackupJSONFile(json: object, identity?: ProfileIdentifier): BackupJSONFileLatest | null {
    // if version 2 return
    if (isBackupJSONFileVersion1(json)) {
        // should upgrade to version 2
        return patchNonBreakingUpgradeForBackupJSONFileVersion1(json)
    }
    if (isBackupJSONFileVersion0(json) && identity) {
        const upgraded = upgradeFromBackupJSONFileVersion0(json, identity)
        if (upgraded === null) return null
        // should upgraded to version 2
        return upgraded
    }
    return null
}
