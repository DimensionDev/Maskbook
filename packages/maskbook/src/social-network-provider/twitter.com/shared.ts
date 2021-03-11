import type { SocialNetwork } from '../../social-network-next/types'
import { twitterBase } from './base'
import { twitterEncoding } from './encoding'
import { usernameValidator } from './utils/user'

export const twitterShared: SocialNetwork.Shared & SocialNetwork.Base = {
    ...twitterBase,
    utils: {
        getHomePage: () => 'https://www.twitter.com',
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
    },
}
