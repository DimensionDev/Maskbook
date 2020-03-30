import type { BackupJSONFileLatest } from '../latest'
import type { PersonaRecord } from '../../../../../database/Persona/Persona.db'
import { Identifier, ECKeyIdentifier, ProfileIdentifier } from '../../../../../database/type'
import { IdentifierMap } from '../../../../../database/IdentifierMap'
export function PersonaRecordToJSONFormat(
    persona: PersonaRecord,
    localKeyMap: WeakMap<CryptoKey, JsonWebKey>,
): BackupJSONFileLatest['personas'][0] {
    return {
        createdAt: persona.createdAt.getTime(),
        updatedAt: persona.updatedAt.getTime(),
        identifier: persona.identifier.toText(),
        publicKey: persona.publicKey,
        privateKey: persona.privateKey,
        nickname: persona.nickname,
        mnemonic: persona.mnemonic,
        localKey: persona.localKey ? localKeyMap.get(persona.localKey) : undefined,
        linkedProfiles: Array.from(persona.linkedProfiles).map(([x, y]) => [x.toText(), y]),
    }
}

export function PersonaRecordFromJSONFormat(
    persona: BackupJSONFileLatest['personas'][0],
    localKeyMap: WeakMap<JsonWebKey, CryptoKey>,
): PersonaRecord {
    if (persona.privateKey && !persona.privateKey.d) throw new Error('Private have no secret')
    return {
        createdAt: new Date(persona.createdAt),
        updatedAt: new Date(persona.updatedAt),
        identifier: Identifier.fromString(persona.identifier, ECKeyIdentifier).unwrap(),
        publicKey: persona.publicKey,
        privateKey: persona.privateKey,
        nickname: persona.nickname,
        mnemonic: persona.mnemonic,
        localKey: persona.localKey ? localKeyMap.get(persona.localKey) : undefined,
        linkedProfiles: new IdentifierMap(new Map(persona.linkedProfiles), ProfileIdentifier),
    }
}
