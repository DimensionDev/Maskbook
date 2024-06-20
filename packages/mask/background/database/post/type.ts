import type { AESJsonWebKey, PersonaIdentifier, PostIVIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import type { DBSchema } from 'idb'
import type { IDBPSafeTransaction } from '../utils/openDB.js'
import type { LatestPostDBRecord } from './dbType.js'

/**
 * @internal
 * This type represented the deserialized data type of LatestPostDBRecord.
 *
 * This type should not be exposed in the API too. They should use PostInformation exported from @masknet/shared-base package.
 */
export interface PostRecord {
    postBy: ProfileIdentifier | undefined
    identifier: PostIVIdentifier
    postCryptoKey?: AESJsonWebKey
    /** Receivers */
    recipients: 'everyone' | Map<ProfileIdentifier, Date>
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

export interface PostDB extends DBSchema {
    /** Use inline keys */
    post: {
        value: LatestPostDBRecord
        key: string
        indexes: {
            'persona, date': [string, Date]
        }
    }
}

export type PostReadOnlyTransaction = IDBPSafeTransaction<PostDB, ['post']>
export type PostReadWriteTransaction = IDBPSafeTransaction<PostDB, ['post'], 'readwrite'>
