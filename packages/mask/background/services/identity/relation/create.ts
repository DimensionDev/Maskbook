import { RelationFavor } from '@masknet/public-api'
import type { ProfileIdentifier, PersonaIdentifier } from '@masknet/shared-base'
import { createRelationsTransaction, createRelationDB } from '../../../database/persona/db.js'

export async function createNewRelation(
    profile: ProfileIdentifier | PersonaIdentifier,
    linked: PersonaIdentifier,
    favor = RelationFavor.UNCOLLECTED,
): Promise<void> {
    const t = await createRelationsTransaction()
    const relationInDB = await t.objectStore('relations').get([linked.toText(), profile.toText()])
    if (relationInDB) return

    await createRelationDB({ profile, linked, favor }, t)
}
