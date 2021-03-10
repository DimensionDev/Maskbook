import type { PostIdentifier, ProfileIdentifier } from '../../database/type'
import { getPostUrlAtFacebook } from '../../social-network-provider/facebook.com/utils/parse-username'
import { getPostUrlAtTwitter } from '../../social-network-provider/twitter.com/utils/url'

// TODO: should move to SNS provider
export function getPostUrl(identifier: PostIdentifier<ProfileIdentifier>) {
    switch (identifier.identifier.network) {
        case 'facebook.com':
            return getPostUrlAtFacebook(identifier, 'open')
        case 'twitter.com':
            return getPostUrlAtTwitter(identifier, false)
        default:
            throw new Error('unknown identifier')
    }
}
