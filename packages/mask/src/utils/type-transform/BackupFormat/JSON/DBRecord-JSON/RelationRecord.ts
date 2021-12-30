import { ECKeyIdentifier, Identifier, ProfileIdentifier } from '@masknet/shared-base'
import type { BackupJSONFileLatest } from '../latest'
import type { RelationRecord } from '../../../../../../background/database/persona/db'

export function RelationRecordToJSONFormat(relation: RelationRecord): BackupJSONFileLatest['relations'][0] {
    return {
        favor: relation.favor,
        persona: relation.linked.toText(),
        profile: relation.profile.toText(),
    }
}

export function RelationRecordFromJSONFormat(
    relation: BackupJSONFileLatest['relations'][0],
): Omit<RelationRecord, 'network'> {
    return {
        favor: relation.favor,
        profile: Identifier.fromString(relation.profile, ProfileIdentifier).unwrap(),
        linked: Identifier.fromString(relation.persona, ECKeyIdentifier).unwrap(),
    }
}
