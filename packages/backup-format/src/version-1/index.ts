import {
    type AESJsonWebKey,
    type EC_Private_JsonWebKey,
    type EC_Public_JsonWebKey,
    isEC_Private_JsonWebKey,
    isEC_JsonWebKey,
    isAESJsonWebKey,
    ProfileIdentifier,
    ECKeyIdentifier,
} from '@masknet/shared-base'
import { isObjectLike } from 'lodash-es'
import { None, Some } from 'ts-results-es'
import { createEmptyNormalizedBackup } from '../normalize/index.js'
import type { NormalizedBackup } from '../normalize/type.js'

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
export async function normalizeBackupVersion1(file: BackupJSONFileVersion1): Promise<NormalizedBackup.Data> {
    const backup = createEmptyNormalizedBackup()

    backup.meta.version = 1
    if (!file.grantedHostPermissions) backup.meta.maskVersion = Some('<=1.5.2')
    else if (!file.maskbookVersion) backup.meta.maskVersion = Some('<=1.6.0')

    if (file.grantedHostPermissions) {
        backup.settings.grantedHostPermissions = file.grantedHostPermissions
    }

    const { whoami, people } = file
    for (const { network, publicKey, userId, nickname, localKey, privateKey } of [...whoami, ...(people || [])]) {
        const identifier = ProfileIdentifier.of(network, userId).expect(
            `backup should not contain invalid identifier parts ${network} and ${userId}`,
        )
        const profile: NormalizedBackup.ProfileBackup = {
            identifier,
            nickname: nickname ? Some(nickname) : None,
            createdAt: None,
            updatedAt: None,
            localKey: None,
            linkedPersona: None,
        }

        if (isEC_JsonWebKey(publicKey)) {
            const personaID = (await ECKeyIdentifier.fromJsonWebKey(publicKey)).unwrap()
            const persona: NormalizedBackup.PersonaBackup = backup.personas.get(personaID) || {
                identifier: personaID,
                nickname: None,
                linkedProfiles: new Map(),
                publicKey,
                privateKey: None,
                localKey: None,
                mnemonic: None,
                createdAt: None,
                updatedAt: None,
                address: None,
            }
            profile.linkedPersona = Some(personaID)

            if (isEC_Private_JsonWebKey(privateKey)) {
                persona.privateKey = Some(privateKey)
            }
            backup.personas.set(personaID, persona)
            persona.linkedProfiles.set(profile.identifier, void 0)
        }
        if (isAESJsonWebKey(localKey)) {
            profile.localKey = Some(localKey)
            if (profile.linkedPersona.isSome() && backup.personas.has(profile.linkedPersona.value)) {
                backup.personas.get(profile.linkedPersona.value)!.localKey = Some(localKey)
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
        previousIdentifiers?: Array<{ network: string; userId: string }>
        nickname?: string
    }>
    people?: Array<{
        network: string
        userId: string
        publicKey: EC_Public_JsonWebKey
        previousIdentifiers?: Array<{ network: string; userId: string }>
        nickname?: string
        groups?: Array<{ network: string; groupID: string; virtualGroupOwner: string | null }>

        // Note: those props are not existed in the backup, just to make the code more readable
        privateKey?: EC_Private_JsonWebKey
        localKey?: AESJsonWebKey
    }>
    grantedHostPermissions?: string[]
}
