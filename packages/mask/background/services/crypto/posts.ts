import { isNonNull } from '@dimensiondev/kit'
import type { PersonaIdentifier, PostInformation, PostIVIdentifier } from '@masknet/shared-base'
import { PostRecord, queryPostPagedDB } from '../../database/post'

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
): Promise<PostInformation[]> {
    return (await queryPostPagedDB(persona, options, count)).map(convertPostRecordToPostInformation).filter(isNonNull)
}

function convertPostRecordToPostInformation({ recipients, ...x }: PostRecord): PostInformation | undefined {
    if (!x.postBy) return undefined
    return {
        ...x,
        postBy: x.postBy,
        recipients: recipients === 'everyone' ? 'everyone' : new Set(recipients.keys()),
    }
}
