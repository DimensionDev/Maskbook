import type { PostRecord as NativePostRecord } from '@masknet/public-api'
import type { PostRecord, PostReadWriteTransaction, PostReadOnlyTransaction, RecipientDetail } from './type'
import {
    PostIVIdentifier,
    Identifier,
    AESJsonWebKey,
    IdentifierMap,
    PersonaIdentifier,
    ProfileIdentifier,
    ECKeyIdentifier,
} from '@masknet/shared-base'
import { nativeAPI } from '../../../shared/native-rpc'

export async function createPostDB(record: PostRecord, t?: PostReadWriteTransaction) {
    console.log({ record })
    return nativeAPI?.api.create_post({ post: postInNative(record) as NativePostRecord })
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

function postInNative(record: Partial<PostRecord> & Pick<PostRecord, 'identifier'>): Partial<NativePostRecord> {
    return {
        postBy: record.postBy ? record.postBy.toText() : undefined,
        identifier: record.identifier.toText(),
        postCryptoKey: record.postCryptoKey,
        recipients:
            record.recipients === 'everyone'
                ? Object.fromEntries(new Map())
                : record.recipients
                ? Object.fromEntries(record.recipients.__raw_map__)
                : undefined,
        foundAt: record.foundAt?.getTime(),
        encryptBy: record.encryptBy?.toText(),
        url: record.url,
        summary: record.summary,
        interestedMeta: record.interestedMeta,
    }
}

function postOutNative(record: NativePostRecord): PostRecord {
    return {
        postBy: Identifier.fromString(record.postBy).unwrap() as unknown as ProfileIdentifier,
        identifier: Identifier.fromString(record.identifier).unwrap() as unknown as PostIVIdentifier,
        postCryptoKey: record.postCryptoKey as unknown as AESJsonWebKey,
        recipients: new IdentifierMap(new Map(Object.entries(record.recipients))) as unknown as IdentifierMap<
            ProfileIdentifier,
            RecipientDetail
        >,
        foundAt: new Date(record.foundAt),
        encryptBy: record.encryptBy
            ? (Identifier.fromString(record.encryptBy).unwrap() as unknown as ECKeyIdentifier)
            : undefined,
        url: record.url,
        summary: record.summary,
        interestedMeta: record.interestedMeta,
    }
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
