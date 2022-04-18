import type { PersonaIdentifier, ProfileIdentifier, RelationFavor } from '@masknet/shared-base'
import { createRelationsTransaction, updateRelationDB } from '../../../database/persona/db'

export async function updateRelation(profile: ProfileIdentifier, linked: PersonaIdentifier, favor: RelationFavor) {
    const t = await createRelationsTransaction()
    await updateRelationDB({ profile, linked, favor }, t)
}
