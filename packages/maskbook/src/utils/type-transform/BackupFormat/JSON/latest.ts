/* eslint-disable import/no-deprecated */
import {
    isBackupJSONFileVersion1,
    patchNonBreakingUpgradeForBackupJSONFileVersion1,
    upgradeFromBackupJSONFileVersion0,
} from './version-1'
import type { ProfileIdentifier } from '../../../../database/type'
import { isBackupJSONFileVersion0 } from './version-0'
import {
    BackupJSONFileVersion2,
    isBackupJSONFileVersion2,
    upgradeFromBackupJSONFileVersion1,
    patchNonBreakingUpgradeForBackupJSONFileVersion2,
} from './version-2'

/**
 * Always use this interface in other code.
 */
export interface BackupJSONFileLatest extends BackupJSONFileVersion2 {}
export function UpgradeBackupJSONFile(json: object, identity?: ProfileIdentifier): BackupJSONFileLatest | null {
    if (isBackupJSONFileVersion2(json)) return patchNonBreakingUpgradeForBackupJSONFileVersion2(json)
    if (isBackupJSONFileVersion1(json))
        return upgradeFromBackupJSONFileVersion1(patchNonBreakingUpgradeForBackupJSONFileVersion1(json))
    if (isBackupJSONFileVersion0(json) && identity) {
        const upgraded = upgradeFromBackupJSONFileVersion0(json, identity)
        if (upgraded === null) return null
        return upgradeFromBackupJSONFileVersion1(upgraded)
    }
    return null
}
