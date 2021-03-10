import type { SocialNetwork } from '../../social-network-next/types'
import { facebookBase } from './base'
import { isValidFacebookUsername } from './parse-username'

export const facebookShared: SocialNetwork.Shared & SocialNetwork.Base = {
    ...facebookBase,
    utils: {
        getHomePage: () => 'https://www.facebook.com',
        isValidUsername: (v) => !!isValidFacebookUsername(v),
        publicKeyEncoding: undefined,
        textPayloadPostProcessor: undefined,
    },
}
