import { ProfileRecord } from '../../../../../database/Persona/Persona.db'
import { BackupJSONFileLatest } from '../latest'

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
