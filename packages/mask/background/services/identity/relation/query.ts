import type { RelationRecord } from '../../../database/persona/db'
import { queryRelations as queryRelationsFromIndexedDB } from '../../../database/persona/web'

export async function mobile_queryRelationsRecordFromIndexedDB(): Promise<RelationRecord[]> {
    if (process.env.architecture !== 'app') throw new Error('This function is only available in app')
    return queryRelationsFromIndexedDB(() => true)
}
