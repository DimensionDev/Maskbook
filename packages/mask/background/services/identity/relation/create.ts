import { RelationFavor } from '@masknet/public-api'
import type { ProfileIdentifier, PersonaIdentifier } from '@masknet/shared-base'
import { createRelationsTransaction, createRelationDB, queryRelations } from '../../../database/persona/db'

export async function createNewRelation(
    profile: ProfileIdentifier,
    linked: PersonaIdentifier,
    favor = RelationFavor.UNCOLLECTED,
): Promise<void> {
    const t = await createRelationsTransaction()
    const relationsInDB = await queryRelations(linked, profile, t)
    if (relationsInDB.length > 0) return

    await createRelationDB({ profile, linked, favor }, t)
}
