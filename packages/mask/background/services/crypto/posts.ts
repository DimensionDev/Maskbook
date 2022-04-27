import type { PersonaIdentifier, PostIVIdentifier } from '@masknet/shared-base'
import { queryPostPagedDB } from '../../database/post'

export interface QueryPagedPostHistoryOptions {
    network: string
    userIds: string[]
    after?: PostIVIdentifier
    pageOffset?: number
}
export async function queryPagedPostHistory(
    persona: PersonaIdentifier,
    options: QueryPagedPostHistoryOptions,
    count: number,
) {
    return queryPostPagedDB(persona, options, count)
}
