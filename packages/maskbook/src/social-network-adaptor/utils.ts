import { twitterBase } from './twitter.com/base'
import { facebookBase } from './facebook.com/base'
import { instagramBase } from './instagram.com/base'
import { CurrentSNSNetwork } from '@masknet/plugin-infra'
import type { SocialNetwork } from '../social-network/types'

export function getCurrentSNSNetwork(current: SocialNetwork.Base['networkIdentifier']) {
    const table = {
        [twitterBase.networkIdentifier]: CurrentSNSNetwork.Twitter,
        [facebookBase.networkIdentifier]: CurrentSNSNetwork.Facebook,
        [instagramBase.networkIdentifier]: CurrentSNSNetwork.Instagram,
    }
    if (current in table) return table[current]
    return CurrentSNSNetwork.Unknown
}
