import { BackupJSONFileLatest } from '../latest'
import { PersonaRecord, LinkedProfileDetails } from '../../../../../database/Persona/Persona.db'
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
        linkedProfiles: Array.from(persona.linkedProfiles).reduce(
            (last, [id, detail]) => ({ ...last, [id.toText()]: detail }),
            {} as Record<string, LinkedProfileDetails>,
        ),
    }
}
