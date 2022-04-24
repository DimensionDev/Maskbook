import type {
    AESJsonWebKey,
    IdentifierMap,
    PersonaIdentifier,
    PostIVIdentifier,
    ProfileIdentifier,
} from '@masknet/shared-base'
import type { DBSchema } from 'idb/with-async-ittr'
import type { IDBPSafeTransaction } from '../utils/openDB'

export type RecipientReason = (
    | { type: 'auto-share' }
    | { type: 'direct' }
    | { type: 'group'; /** @deprecated */ group: unknown }
) & {
    /**
     * When we send the key to them by this reason?
     * If the unix timestamp of this Date is 0,
     * should display it as "unknown" or "before Nov 2019"
     */
    at: Date
}
export interface RecipientDetail {
    /** Why they're able to receive this message? */
    reason: RecipientReason[]
}
export interface PostRecord {
    postBy: ProfileIdentifier | undefined
    identifier: PostIVIdentifier
    postCryptoKey?: AESJsonWebKey
    /**
     * Receivers
     */
    recipients: 'everyone' | IdentifierMap<ProfileIdentifier, RecipientDetail>
    /** @deprecated */
    recipientGroups?: unknown
    /**
     * When does Mask find this post.
     * For your own post, it is when Mask created this post.
     * For others post, it is when you see it first time.
     */
    foundAt: Date
    encryptBy?: PersonaIdentifier
    /** The URL of this post */
    url?: string
    /** Summary of this post (maybe front 20 chars). */
    summary?: string
    /** Interested metadata contained in this post. */
    interestedMeta?: ReadonlyMap<string, unknown>
}

export interface PostDBRecord extends Omit<PostRecord, 'postBy' | 'identifier' | 'recipients' | 'encryptBy'> {
    postBy: { userId: string; network: string } | undefined
    identifier: string
    recipients: true | Map<string, RecipientDetail>
    encryptBy?: string
}

export interface PostDB extends DBSchema {
    /** Use inline keys */
    post: {
        value: PostDBRecord
        key: string
        indexes: {
            'persona, date': [string, Date]
        }
    }
}

export type PostReadOnlyTransaction = IDBPSafeTransaction<PostDB, ['post'], 'readonly'>
export type PostReadWriteTransaction = IDBPSafeTransaction<PostDB, ['post'], 'readwrite'>
