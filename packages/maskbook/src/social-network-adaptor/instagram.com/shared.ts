import type { SocialNetwork } from '../../social-network/types'
import { instagramBase } from './base'

export const instagramShared: SocialNetwork.Shared & SocialNetwork.Base = {
    ...instagramBase,
    utils: {
        getHomePage: () => 'https://www.instagram.com/',
    },
}
