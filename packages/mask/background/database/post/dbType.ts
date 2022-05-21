import type { AESJsonWebKey } from '@masknet/shared-base'

// This file records the history version of the database. NEVER change old type.
/** @internal */
export declare namespace PostDB_HistoryTypes {
    export interface Version2PostRecord {
        postBy: { userId: string; network: string } | undefined
        identifier: string
        recipientGroups?: unknown
        recipients?: Array<{ userId: string; network: string }>
        foundAt: Date
        postCryptoKey?: CryptoKey
    }

    // #region Version 3
    export interface Version3PostRecord {
        // Inherited from Version2PostRecord
        postBy: { userId: string; network: string } | undefined
        identifier: string
        recipientGroups?: unknown
        foundAt: Date
        postCryptoKey?: CryptoKey
        // Type of "recipients" has changed.
        recipients: Record<string, Version3RecipientDetail>
    }
    export type Version3_RecipientReason = (
        | { type: 'auto-share' }
        | { type: 'direct' }
        | { type: 'group'; /** @deprecated */ group: unknown }
    ) & { at: Date }
    export type Version3RecipientDetail = {
        /** Why they're able to receive this message? */
        reason: Version3_RecipientReason[]
    }
    // #endregion

    export interface Version4PostRecord {
        // Inherited from Version3PostRecord
        postBy: { userId: string; network: string } | undefined
        identifier: string
        recipientGroups?: unknown
        foundAt: Date
        postCryptoKey?: CryptoKey
        // Type of "recipients" has changed from Record to Map.
        recipients: Map<string, Version3RecipientDetail>
    }

    export interface Version5PostRecord {
        // Inherited from Version4PostRecord
        postBy: { userId: string; network: string } | undefined
        identifier: string
        recipientGroups?: unknown
        foundAt: Date
        // postCryptoKey is changed from native CryptoKey object to AESJsonWebKey.
        postCryptoKey?: AESJsonWebKey
        // recipients is changed to allow share public (represented by true).
        recipients: true | Map<string, Version3RecipientDetail>
        // New properties
        encryptBy?: {
            compressedPoint?: string
            encodedCompressedKey?: string
            type: 'ec_key'
            curve: 'secp256k1'
        }
        url?: string
        summary?: string
        interestedMeta?: ReadonlyMap<string, unknown>
    }

    export interface LatestPostDBRecord {
        // Inherited from Version5PostRecord
        postBy: { userId: string; network: string } | undefined
        identifier: string
        recipientGroups?: unknown
        foundAt: Date
        postCryptoKey?: AESJsonWebKey
        recipients: true | Map<string, Version3RecipientDetail>
        url?: string
        summary?: string
        interestedMeta?: ReadonlyMap<string, unknown>

        // encryptBy is changed from an object to a string.
        encryptBy?: string
    }
}

// When you want to make a breaking change on the following type, copy it to the history type above.
// The following type should marked as @internal, so they're not going to exposed in the public API.

/** @internal */
export type LatestRecipientReasonDB = (
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
/** @internal */
export interface LatestRecipientDetailDB {
    /** Why they're able to receive this message? */
    reason: LatestRecipientReasonDB[]
}
/** @internal */
export interface LatestPostDBRecord {
    // Inherited from Version5PostRecord
    postBy: { userId: string; network: string } | undefined
    identifier: string
    recipientGroups?: unknown
    foundAt: Date
    postCryptoKey?: AESJsonWebKey
    recipients: true | Map<string, LatestRecipientDetailDB>
    url?: string
    summary?: string
    interestedMeta?: ReadonlyMap<string, unknown>

    // encryptBy is changed from an object to a string.
    encryptBy?: string
}
