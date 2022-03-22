import {
    AESJsonWebKey,
    ECKeyIdentifierFromJsonWebKey,
    EC_Private_JsonWebKey,
    EC_Public_JsonWebKey,
    IdentifierMap,
    isAESJsonWebKey,
    isEC_Private_JsonWebKey,
    isEC_Public_JsonWebKey,
    ProfileIdentifier,
} from '@masknet/shared-base'
import { isObjectLike } from 'lodash-unified'
import { createEmptyNormalizedBackup } from '../normalize'
import type { NormalizedBackup } from '../normalize/type'

export function isBackupVersion0(obj: unknown): obj is BackupJSONFileVersion0 {
    if (!isObjectLike(obj)) return false
    try {
        const data: BackupJSONFileVersion0 = obj as any
        if (!data.local || !data.key || !data.key.key || !data.key.key.privateKey || !data.key.key.publicKey)
            return false
        return true
    } catch {
        return false
    }
}
export function normalizeBackupVersion0(file: BackupJSONFileVersion0): NormalizedBackup.Data {
    const backup = createEmptyNormalizedBackup()
    backup.meta.version = 0
    backup.meta.maskVersion = '<=1.3.2'

    const { local } = file
    const { username, key } = file.key
    const { publicKey, privateKey } = key

    if (!isEC_Public_JsonWebKey(publicKey)) return backup

    const persona: NormalizedBackup.PersonaBackup = {
        identifier: ECKeyIdentifierFromJsonWebKey(publicKey),
        publicKey,
        linkedProfiles: new IdentifierMap<ProfileIdentifier, any>(new Map(), ProfileIdentifier),
    }
    if (isEC_Private_JsonWebKey(privateKey)) persona.privateKey = privateKey
    if (isAESJsonWebKey(local)) persona.localKey = local
    backup.personas.set(persona.identifier, persona)

    if (username && username !== '$unknown' && username !== '$local') {
        const profile: NormalizedBackup.ProfileBackup = {
            identifier: new ProfileIdentifier('facebook.com', username),
            linkedPersona: persona.identifier,
        }
        if (isAESJsonWebKey(local)) persona.localKey = local
        backup.profiles.set(profile.identifier, profile)
        persona.linkedProfiles.set(profile.identifier, void 0)
    }

    return backup
}
interface BackupJSONFileVersion0 {
    key: {
        username: string
        key: { publicKey: EC_Public_JsonWebKey; privateKey?: EC_Private_JsonWebKey }
        algor: unknown
        usages: string[]
    }
    local: AESJsonWebKey
}
