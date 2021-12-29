/* eslint-disable import/no-deprecated */
import {
    isBackupJSONFileVersion1,
    patchNonBreakingUpgradeForBackupJSONFileVersion1,
    upgradeFromBackupJSONFileVersion0,
} from './version-1'
import { PluginID_FileService, ProfileIdentifier } from '@masknet/shared-base'
import { isBackupJSONFileVersion0 } from './version-0'
import {
    BackupJSONFileVersion2,
    isBackupJSONFileVersion2,
    upgradeFromBackupJSONFileVersion1,
    patchNonBreakingUpgradeForBackupJSONFileVersion2,
} from './version-2'

export interface BackupPreview {
    personas: number
    accounts: number
    posts: number
    contacts: number
    relations: number
    files: number
    wallets: number
    createdAt: number
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
        personas: json.personas.length,
        accounts: json.personas.reduce((a, b) => a + b.linkedProfiles.length, 0),
        posts: json.posts.length,
        contacts: json.profiles.length,
        relations: json.relations.length,
        files: json.plugin?.[PluginID_FileService]?.length || 0,
        wallets: json.wallets.length,
        createdAt: json._meta_.createdAt,
    }
}
