import type { MobilePostRecord as NativePostRecord } from '@masknet/public-api'
import type { PostRecord, PostReadWriteTransaction, PostReadOnlyTransaction } from './type'
import {
    PostIVIdentifier,
    AESJsonWebKey,
    PersonaIdentifier,
    ProfileIdentifier,
    ECKeyIdentifier,
    convertRawMapToIdentifierMap,
} from '@masknet/shared-base'
import { nativeAPI } from '../../../shared/native-rpc'
import { isNonNull } from '@dimensiondev/kit'

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
                              reason: RecipientReasonToJSON(detail),
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
        postBy: ProfileIdentifier.from(record.postBy).unwrap(),
        identifier: PostIVIdentifier.from(record.identifier).unwrap(),
        postCryptoKey: record.postCryptoKey as unknown as AESJsonWebKey,
        recipients: convertRawMapToIdentifierMap(
            Object.entries(record.recipients)
                .map(([a, b]): [string, Date] | undefined => {
                    const firstDate = b.reason.find((x) => x.at)?.at
                    if (firstDate) return [a, new Date(firstDate)]
                    return undefined
                })
                .filter(isNonNull),
            ProfileIdentifier,
        ),
        foundAt: new Date(record.foundAt),
        encryptBy: ECKeyIdentifier.from(record.encryptBy).unwrapOr(undefined),
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

type RecipientReasonMobile = { type: 'auto-share'; at: number } | { type: 'direct'; at: number }

function RecipientReasonToJSON(y: Date): RecipientReasonMobile {
    return { type: 'direct', at: y.getTime() }
}
