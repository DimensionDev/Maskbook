import type { PostRecord as NativePostRecord } from '@masknet/public-api'
import type {
    PostRecord,
    PostReadWriteTransaction,
    PostReadOnlyTransaction,
    RecipientDetail,
    RecipientReason,
} from './type'
import {
    PostIVIdentifier,
    AESJsonWebKey,
    IdentifierMap,
    PersonaIdentifier,
    ProfileIdentifier,
    ECKeyIdentifier,
} from '@masknet/shared-base'
import { nativeAPI } from '../../../shared/native-rpc'
import { unreachable } from '@dimensiondev/kit'

export async function createPostDB(record: PostRecord, t?: PostReadWriteTransaction) {
    await nativeAPI?.api.create_post({ post: postInNative(record) as NativePostRecord })
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
                ? Object.fromEntries(
                      Array.from(record.recipients).map(([identifier, detail]) => [
                          identifier.toText(),
                          {
                              reason: Array.from(detail.reason).map<RecipientReasonJSON>(RecipientReasonToJSON),
                          },
                      ]),
                  )
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
        postBy: ProfileIdentifier.fromString(record.postBy, ProfileIdentifier).unwrap(),
        identifier: PostIVIdentifier.fromString(record.identifier, PostIVIdentifier).unwrap(),
        postCryptoKey: record.postCryptoKey as unknown as AESJsonWebKey,
        recipients: new IdentifierMap<ProfileIdentifier, RecipientDetail>(
            new Map(Object.entries(record.recipients)) as any,
        ),
        foundAt: new Date(record.foundAt),
        encryptBy: record.encryptBy
            ? ECKeyIdentifier.fromString(record.encryptBy, ECKeyIdentifier).unwrap()
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

export async function withPostDBTransaction(task: (t: PostReadWriteTransaction) => Promise<void>) {
    await task(null!)
}

// #endregion

type RecipientReasonJSON = ({ type: 'auto-share' } | { type: 'direct' }) & {
    at: number
}

function RecipientReasonToJSON(y: RecipientReason): RecipientReasonJSON {
    if (y.type === 'direct' || y.type === 'auto-share')
        return { at: y.at.getTime(), type: y.type } as RecipientReasonJSON
    else if (y.type === 'group') return { at: y.at.getTime(), type: 'direct' }
    return unreachable(y)
}
