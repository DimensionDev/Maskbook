import type { PersonaIdentifier, ProfileIdentifier, RelationFavor } from '@masknet/shared-base'
import { createRelationsTransaction, deletePersonaRelationDB, updateRelationDB } from '../../../database/persona/db.js'

export async function updateRelation(
    profile: ProfileIdentifier | PersonaIdentifier,
    linked: PersonaIdentifier,
    favor: RelationFavor,
) {
    const t = await createRelationsTransaction()
    await updateRelationDB({ profile, linked, favor }, t)
}

export async function deletePersonaRelation(persona: PersonaIdentifier, linked: PersonaIdentifier) {
    const t = await createRelationsTransaction()
    await deletePersonaRelationDB(persona, linked, t)
}
