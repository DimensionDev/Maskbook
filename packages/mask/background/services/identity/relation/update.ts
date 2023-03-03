import type { PersonaIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import { createRelationsTransaction, updateRelationDB } from '../../../database/persona/db.js'
import type { RelationFavor } from '@masknet/public-api'

export async function updateRelation(profile: ProfileIdentifier, linked: PersonaIdentifier, favor: RelationFavor) {
    const t = await createRelationsTransaction()
    await updateRelationDB({ profile, linked, favor }, t)
}
