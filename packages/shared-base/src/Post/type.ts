import type { PostIVIdentifier, ProfileIdentifier } from '../Identifier'

export interface PostInformation {
    postBy: ProfileIdentifier
    identifier: PostIVIdentifier
    recipients: 'everyone' | Map<ProfileIdentifier, Date>
    foundAt?: Date
    url?: string
    summary?: string
    interestedMeta?: ReadonlyMap<string, unknown>
}
