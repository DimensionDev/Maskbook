import { ProfileRecord } from '../../../../../database/Persona/Persona.db'
import { BackupJSONFileLatest } from '../latest'
import { ProfileIdentifier, Identifier, ECKeyIdentifier } from '../../../../../database/type'

export function ProfileRecordToJSONFormat(
    profile: ProfileRecord,
    localKeyMap: WeakMap<CryptoKey, JsonWebKey>,
): BackupJSONFileLatest['profiles'][0] {
    return {
        createdAt: profile.createdAt.getTime(),
        updatedAt: profile.updatedAt.getTime(),
        identifier: profile.identifier.toText(),
        nickname: profile.nickname,
        localKey: profile.localKey ? localKeyMap.get(profile.localKey) : undefined,
        linkedPersona: profile.linkedPersona?.toText(),
    }
}

export function ProfileRecordFromJSONFormat(
    profile: BackupJSONFileLatest['profiles'][0],
    localKeyMap: WeakMap<JsonWebKey, CryptoKey>,
): ProfileRecord {
    return {
        createdAt: new Date(profile.createdAt),
        updatedAt: new Date(profile.updatedAt),
        identifier: Identifier.fromString(profile.identifier, ProfileIdentifier).unwrap(),
        nickname: profile.nickname,
        localKey: profile.localKey ? localKeyMap.get(profile.localKey) : undefined,
        linkedPersona: profile.linkedPersona
            ? Identifier.fromString(profile.linkedPersona, ECKeyIdentifier).unwrap()
            : undefined,
    }
}
