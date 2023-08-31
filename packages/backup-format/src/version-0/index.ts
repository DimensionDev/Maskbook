import {
    type AESJsonWebKey,
    type EC_Private_JsonWebKey,
    type EC_Public_JsonWebKey,
    isAESJsonWebKey,
    isEC_Private_JsonWebKey,
    isEC_JsonWebKey,
    ProfileIdentifier,
    ECKeyIdentifier,
} from '@masknet/shared-base'
import { isObjectLike } from 'lodash-es'
import { None, Some } from 'ts-results-es'
import { createEmptyNormalizedBackup } from '../normalize/index.js'
import type { NormalizedBackup } from '../normalize/type.js'

export function isBackupVersion0(obj: unknown): obj is BackupJSONFileVersion0 {
    if (!isObjectLike(obj)) return false
    try {
        const data: BackupJSONFileVersion0 = obj as any
        if (!data.local || !data.key?.key?.privateKey || !data.key.key.publicKey) return false
        return true
    } catch {
        return false
    }
}
export async function normalizeBackupVersion0(file: BackupJSONFileVersion0): Promise<NormalizedBackup.Data> {
    const backup = createEmptyNormalizedBackup()
    backup.meta.version = 0
    backup.meta.maskVersion = Some('<=1.3.2')

    const { local } = file
    const { username, key } = file.key
    const { publicKey, privateKey } = key

    if (!isEC_JsonWebKey(publicKey)) return backup

    const persona: NormalizedBackup.PersonaBackup = {
        identifier: (await ECKeyIdentifier.fromJsonWebKey(publicKey)).unwrap(),
        publicKey,
        linkedProfiles: new Map(),
        localKey: isAESJsonWebKey(local) ? Some(local) : None,
        privateKey: isEC_Private_JsonWebKey(privateKey) ? Some(privateKey) : None,
        mnemonic: None,
        nickname: None,
        createdAt: None,
        updatedAt: None,
        address: None,
    }
    backup.personas.set(persona.identifier, persona)

    const identifier = ProfileIdentifier.of('facebook.com', username)
    if (identifier.isSome()) {
        const profile: NormalizedBackup.ProfileBackup = {
            identifier: identifier.value,
            linkedPersona: Some(persona.identifier),
            createdAt: None,
            updatedAt: None,
            localKey: isAESJsonWebKey(local) ? Some(local) : None,
            nickname: None,
        }
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
