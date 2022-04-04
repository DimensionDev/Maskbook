import { PostIdentifier, ProfileIdentifier } from '@masknet/shared-base'
import { openWindow } from '@masknet/shared-base-ui'
import urlcat from 'urlcat'
import type { SocialNetwork } from '../../social-network/types'
import { createSNSAdaptorSpecializedPostContext } from '../../social-network/utils/create-post-context'
import { deconstructPayload } from '../../utils'
import { twitterBase } from './base'
import { twitterEncoding } from './encoding'
import { usernameValidator } from './utils/user'

const getPostURL = (post: PostIdentifier): URL | null => {
    if (!(post.identifier instanceof ProfileIdentifier)) return null
    return new URL(`https://twitter.com/${post.identifier.userId}/status/${post.postId}`)
}
export const twitterShared: SocialNetwork.Shared & SocialNetwork.Base = {
    ...twitterBase,
    utils: {
        getHomePage: () => 'https://twitter.com',
        getProfilePage: (userId) => `https://twitter.com/${userId}`,
        isValidUsername: usernameValidator,
        textPayloadPostProcessor: {
            encoder(text) {
                return twitterEncoding.payloadEncoder(text)
            },
            decoder(text) {
                return twitterEncoding.payloadDecoder(text)
            },
        },
        getPostURL,
        share(text) {
            const url = this.getShareLinkURL!(text)
            const width = 700
            const height = 520
            const openedWindow = openWindow(url, 'share', {
                width,
                height,
                screenX: window.screenX + (window.innerWidth - width) / 2,
                screenY: window.screenY + (window.innerHeight - height) / 2,
                behaviors: { toolbar: true, status: true, resizable: true, scrollbars: true },
            })
            if (openedWindow === null) {
                location.assign(url)
            }
        },
        getShareLinkURL(message) {
            const url = urlcat('https://twitter.com/intent/tweet', { text: message })
            return new URL(url)
        },
        createPostContext: createSNSAdaptorSpecializedPostContext({
            payloadParser: deconstructPayload,
            payloadDecoder: twitterEncoding.payloadDecoder,
            getURLFromPostIdentifier: getPostURL,
        }),
    },
}
