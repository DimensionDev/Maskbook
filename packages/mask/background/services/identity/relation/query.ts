import type { PersonaIdentifier } from '@masknet/shared-base'
import { queryRelationsPagedDB, type RelationRecord } from '../../../database/persona/db.js'

interface QueryRelationPagedOptions {
    network: string
    after?: RelationRecord
    pageOffset?: number
}

export async function queryRelationPaged(
    currentPersona: PersonaIdentifier | undefined | null,
    options: QueryRelationPagedOptions,
    count: number,
): Promise<RelationRecord[]> {
    if (!currentPersona) return []
    return queryRelationsPagedDB(currentPersona, options, count)
}
