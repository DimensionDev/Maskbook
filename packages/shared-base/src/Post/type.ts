import type { PostIVIdentifier, ProfileIdentifier } from '../Identifier'

export interface PostInformation {
    postBy: ProfileIdentifier
    identifier: PostIVIdentifier
    recipients: 'everyone' | Set<ProfileIdentifier>
    url?: string
    summary?: string
    interestedMeta?: ReadonlyMap<string, unknown>
}
