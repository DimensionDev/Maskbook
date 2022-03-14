import { twitterBase } from './twitter.com/base'
import { facebookBase } from './facebook.com/base'
import { instagramBase } from './instagram.com/base'
import { CurrentSNSNetwork } from '@masknet/plugin-infra'
import type { SocialNetwork } from '../social-network/types'
import { activatedSocialNetworkUI, globalUIState } from '../social-network'

export function getCurrentSNSNetwork(current: SocialNetwork.Base['networkIdentifier']) {
    const table = {
        [twitterBase.networkIdentifier]: CurrentSNSNetwork.Twitter,
        [facebookBase.networkIdentifier]: CurrentSNSNetwork.Facebook,
        [instagramBase.networkIdentifier]: CurrentSNSNetwork.Instagram,
    }
    if (current in table) return table[current]
    return CurrentSNSNetwork.Unknown
}

export const getCurrentIdentifier = () => {
    const current = activatedSocialNetworkUI.collecting.identityProvider?.recognized.value

    return (
        globalUIState.profiles.value.find((i) => i.identifier.equals(current?.identifier)) ||
        globalUIState.profiles.value[0]
    )
}

export const createCenterWindow = (width: number, height: number) => {
    const x = window.screenX + (window.innerWidth - width) / 2
    const y = window.screenY + (window.innerHeight - height) / 2
    const win = window.open(
        '',
        '_blank',
        [
            `screenX=${x}`,
            `screenY=${y}`,
            `height=${height}`,
            `width=${width}`,
            'resizable=no',
            'scrollbars=no',
            'status=no',
            'noopener',
            'noreferrer',
        ].join(','),
    )
    return win
}
