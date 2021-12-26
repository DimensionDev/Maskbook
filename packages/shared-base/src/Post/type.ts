import type { PostIVIdentifier, ProfileIdentifier } from '../Identifier/type'
import type { IdentifierMap } from '../Identifier/IdentifierMap'

/**
 * UI display
 */
export type RecipientReason = ({ type: 'auto-share' } | { type: 'direct' } | { type: 'group'; group: any }) & {
    at: Date
}
export interface RecipientDetail {
    reason: RecipientReason[]
}

export interface PostRecord {
    postBy: ProfileIdentifier
    identifier: PostIVIdentifier
    recipients: 'everyone' | IdentifierMap<ProfileIdentifier, RecipientDetail>
    foundAt: Date
    url?: string
    summary?: string
    interestedMeta?: ReadonlyMap<string, unknown>
}
