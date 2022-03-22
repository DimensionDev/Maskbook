import {
    AESJsonWebKey,
    ECKeyIdentifierFromJsonWebKey,
    EC_Private_JsonWebKey,
    EC_Public_JsonWebKey,
    isEC_Private_JsonWebKey,
    isEC_Public_JsonWebKey,
    isAESJsonWebKey,
    ProfileIdentifier,
    IdentifierMap,
} from '@masknet/shared-base'
import { isObjectLike } from 'lodash-unified'
import { createEmptyNormalizedBackup } from '../normalize'
import type { NormalizedBackup } from '../normalize/type'

export function isBackupVersion1(obj: unknown): obj is BackupJSONFileVersion1 {
    if (!isObjectLike(obj)) return false
    try {
        const data: BackupJSONFileVersion1 = obj as any
        if (data.version !== 1) return false
        if (!Array.isArray(data.whoami)) return false
        if (!data.whoami) return false
        return true
    } catch {
        return false
    }
}
export function normalizeBackupVersion1(file: BackupJSONFileVersion1): NormalizedBackup.Data {
    const backup = createEmptyNormalizedBackup()

    backup.meta.version = 1
    if (!file.grantedHostPermissions) backup.meta.maskVersion = '<=1.5.2'
    else if (!file.maskbookVersion) backup.meta.maskVersion = '<=1.6.0'

    if (file.grantedHostPermissions) {
        backup.settings.grantedHostPermissions = file.grantedHostPermissions
    }

    const { whoami, people } = file
    for (const { network, publicKey, userId, nickname, localKey, privateKey } of [...whoami, ...(people || [])]) {
        const profile: NormalizedBackup.ProfileBackup = {
            identifier: new ProfileIdentifier(network, userId),
            nickname,
        }

        if (isEC_Public_JsonWebKey(publicKey)) {
            const personaID = ECKeyIdentifierFromJsonWebKey(publicKey)
            const persona = backup.personas.get(personaID) || {
                identifier: personaID,
                publicKey,
                linkedProfiles: new IdentifierMap(new Map(), ProfileIdentifier),
            }
            if (isEC_Private_JsonWebKey(privateKey)) {
                persona.privateKey = privateKey
            }
            persona.linkedProfiles.set(profile.identifier, void 0)
            profile.linkedPersona = personaID
        }
        if (isAESJsonWebKey(localKey)) {
            profile.localKey = localKey
            if (profile.linkedPersona && backup.personas.has(profile.linkedPersona)) {
                backup.personas.get(profile.linkedPersona)!.localKey = localKey
            }
        }
    }

    return backup
}

interface BackupJSONFileVersion1 {
    maskbookVersion?: string
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

        // Note: those props are not existed in the backup, just to make the code more readable
        privateKey?: EC_Private_JsonWebKey
        localKey?: AESJsonWebKey
    }>
    grantedHostPermissions?: string[]
}
