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

export interface BackupPreview {
    email?: string
    personas: number
    accounts: number
    posts: number
    contacts: number
    files: number
    wallets: number
}

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

export function getBackupPreviewInfo(json: BackupJSONFileLatest): BackupPreview {
    return {
        email: 'alice@example.com', // TODO: email
        personas: json.personas.length,
        accounts: json.personas.reduce((a, b) => a + b.linkedProfiles.length, 0),
        posts: json.posts.length,
        contacts: json.profiles.length,
        files: 0, // TODO: file
        wallets: json.wallets.length,
    }
}
