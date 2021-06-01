import type { GroupIdentifier, ProfileIdentifier, PostIVIdentifier, AESJsonWebKey, IdentifierMap } from '../'

//#region types
/**
 * When you change this, change RecipientReasonJSON as well!
 */
export type RecipientReason = (
    | { type: 'auto-share' }
    | { type: 'direct' }
    | { type: 'group'; group: GroupIdentifier }
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
    /**
     * For old data stored before version 3, this identifier may be ProfileIdentifier.unknown
     */
    postBy: ProfileIdentifier
    identifier: PostIVIdentifier
    postCryptoKey?: AESJsonWebKey
    /**
     * Receivers
     */
    recipients: IdentifierMap<ProfileIdentifier, RecipientDetail>
    /**
     * This post shared with these groups.
     */
    recipientGroups: GroupIdentifier[]
    /**
     * When does Mask find this post.
     * For your own post, it is when Mask created this post.
     * For others post, it is when you see it first time.
     */
    foundAt: Date
}
