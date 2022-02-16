import type { PostRecord as NativePostRecord } from '@masknet/public-api'
import type { PostRecord, PostReadWriteTransaction, PostReadOnlyTransaction } from './type'
import { PostIVIdentifier, Identifier, AESJsonWebKey, IdentifierMap, PersonaIdentifier } from '@masknet/shared-base'
import { nativeAPI } from '../../../shared/native-rpc'

export async function createPostDB(record: PostRecord, t?: PostReadWriteTransaction) {
    return nativeAPI?.api.create_post({ post: postInNative(record) })
}

export async function updatePostDB(
    updateRecord: Partial<PostRecord> & Pick<PostRecord, 'identifier'>,
    mode: 'append' | 'override',
    t?: PostReadWriteTransaction,
): Promise<void> {
    await nativeAPI?.api.update_post({
        post: postInNative(updateRecord),
        options: {
            mode: mode === 'append' ? 0 : mode === 'override' ? 1 : 0,
        },
    })
    return
}

export async function queryPostDB(record: PostIVIdentifier, t?: PostReadOnlyTransaction): Promise<PostRecord | null> {
    const result = await nativeAPI?.api.query_post({ identifier: record.toText() })
    return result ? postOutNative(result) : null
}

export async function queryPostPagedDB(
    linked: PersonaIdentifier,
    options: {
        network: string
        userIds: string[]
        after?: PostIVIdentifier
        pageOffset?: number
    },
    count: number,
): Promise<PostRecord[]> {
    const results = await nativeAPI?.api.query_posts({
        userIds: options.userIds,
        network: options.network,
        encryptBy: linked.toText(),
        pageOption: options.pageOffset
            ? {
                  pageSize: count,
                  pageOffset: options.pageOffset,
              }
            : undefined,
    })
    if (!results?.length) return []
    return results.map((r) => postOutNative(r))
}

function postInNative(record: Partial<PostRecord> & Pick<PostRecord, 'identifier'>): NativePostRecord {
    return {
        postBy: record.postBy ? record.postBy.toText() : undefined,
        identifier: record.identifier.toText(),
        postCryptoKey: record.postCryptoKey,
        recipients:
            record.recipients === 'everyone'
                ? 'everyone'
                : record.recipients
                ? Object.fromEntries(record.recipients.__raw_map__)
                : undefined,
        foundAt: record.foundAt ? record.foundAt.getTime() : undefined,
        encryptBy: record.encryptBy?.toText(),
        url: record.url,
        summary: record.summary,
        interestedMeta: record.interestedMeta,
    } as NativePostRecord
}

function postOutNative(record: NativePostRecord): PostRecord {
    return {
        postBy: Identifier.fromString(record.postBy).unwrap(),
        identifier: Identifier.fromString(record.identifier).unwrap(),
        postCryptoKey: record.postCryptoKey as unknown as AESJsonWebKey,
        recipients:
            record.recipients === 'everyone'
                ? 'everyone'
                : new IdentifierMap(new Map(Object.entries(record.recipients))),
        foundAt: new Date(record.foundAt),
        encryptBy: record.encryptBy ? Identifier.fromString(record.encryptBy).unwrap() : undefined,
        url: record.url,
        summary: record.summary,
        interestedMeta: record.interestedMeta,
    } as PostRecord
}

// #region Not available on native.
export async function queryPostsDB(
    query: string | ((data: PostRecord, id: PostIVIdentifier) => boolean),
    t?: PostReadOnlyTransaction,
): Promise<PostRecord[]> {
    return []
}

export const PostDBAccess = () => undefined
// #endregion
