import type { ProfileRecord } from '../../../../../../background/database/persona/db'
import type { BackupJSONFileLatest } from '../latest'
import { ProfileIdentifier, Identifier, ECKeyIdentifier } from '../../../../../database/type'

export function ProfileRecordToJSONFormat(profile: ProfileRecord): BackupJSONFileLatest['profiles'][0] {
    return {
        createdAt: profile.createdAt.getTime(),
        updatedAt: profile.updatedAt.getTime(),
        identifier: profile.identifier.toText(),
        nickname: profile.nickname,
        localKey: profile.localKey,
        linkedPersona: profile.linkedPersona?.toText(),
    }
}

export function ProfileRecordFromJSONFormat(profile: BackupJSONFileLatest['profiles'][0]): ProfileRecord {
    return {
        createdAt: new Date(profile.createdAt),
        updatedAt: new Date(profile.updatedAt),
        identifier: Identifier.fromString(profile.identifier, ProfileIdentifier).unwrap(),
        nickname: profile.nickname,
        localKey: profile.localKey,
        linkedPersona: profile.linkedPersona
            ? Identifier.fromString(profile.linkedPersona, ECKeyIdentifier).unwrap()
            : undefined,
    }
}
