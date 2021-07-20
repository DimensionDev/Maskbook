import { ProfileIdentifier } from '@masknet/shared'
import type { SocialNetwork } from '../../social-network/types'
import { createSNSAdaptorSpecializedPostContext } from '../../social-network/utils/create-post-context'
import { deconstructPayload } from '../../utils'
import { twitterBase } from './base'
import { twitterEncoding } from './encoding'
import { usernameValidator } from './utils/user'

export const twitterShared: SocialNetwork.Shared & SocialNetwork.Base = {
    ...twitterBase,
    utils: {
        getHomePage: () => 'https://twitter.com',
        isValidUsername: usernameValidator,
        publicKeyEncoding: {
            encoder(text) {
                return twitterEncoding.publicKeyEncoder(text)
            },
            decoder(text) {
                return twitterEncoding.publicKeyDecoder(text)
            },
        },
        textPayloadPostProcessor: {
            encoder(text) {
                return twitterEncoding.payloadEncoder(text)
            },
            decoder(text) {
                return twitterEncoding.payloadDecoder(text)
            },
        },
        getPostURL(post) {
            if (!(post.identifier instanceof ProfileIdentifier)) return null
            return new URL(`https://twitter.com/${post.identifier.userId}/status/${post.postId}`)
        },
        getShareLinkURL(message) {
            return new URL(`https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`)
        },
        createPostContext: createSNSAdaptorSpecializedPostContext({
            payloadParser: deconstructPayload,
            payloadDecoder: twitterEncoding.payloadDecoder,
        }),
    },
}
