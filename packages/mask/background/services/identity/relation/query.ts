import type { PersonaIdentifier } from '@masknet/shared-base'
import { queryRelationsPagedDB, RelationRecord } from '../../../database/persona/db'
import { queryRelations as queryRelationsFromIndexedDB } from '../../../database/persona/web'

export async function mobile_queryRelationsRecordFromIndexedDB(): Promise<RelationRecord[]> {
    if (process.env.architecture !== 'app') throw new Error('This function is only available in app')
    return queryRelationsFromIndexedDB()
}

export interface QueryRelationPagedOptions {
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
