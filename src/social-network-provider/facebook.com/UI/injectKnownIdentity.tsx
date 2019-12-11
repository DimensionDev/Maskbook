import * as React from 'react'
import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { SocialNetworkUI } from '../../../social-network/ui'
import { PersonKnown } from '../../../components/InjectedComponents/PersonKnown'
import { ProfileIdentifier } from '../../../database/type'

const othersBioLiveSelectorMobile = new LiveSelector().querySelector<HTMLDivElement>(
    '[data-sigil=timeline-cover]:not(:first-child)',
)

const othersBioLiveSelectorPC = new LiveSelector().querySelector<HTMLDivElement>(
    '#intro_container_id > div:first-child',
)

function getCurrentIdentity() {
    if (location.pathname === '/profile.php') {
        try {
            const id = new URLSearchParams(location.search).get('id')
            if (!id) return null
            return new ProfileIdentifier('facebook.com', id)
        } catch {}
    }
    try {
        const id = location.pathname.substr(1)
        return new ProfileIdentifier('facebook.com', id)
    } catch {}
    return null
}

export function injectKnownIdentityAtFacebook(this: SocialNetworkUI) {
    const self = othersBioLiveSelectorMobile.clone().concat(othersBioLiveSelectorPC)
    const watcher = new MutationObserverWatcher(self)
        .setDOMProxyOption({
            afterShadowRootInit: { mode: 'closed' },
        })
        .useForeach(() => {
            const umount = renderInShadowRoot(<PersonKnown whois={getCurrentIdentity()} />, renderPoint)
            return umount
        })
        .startWatch({
            childList: true,
            subtree: true,
            characterData: true,
        })
    const renderPoint = watcher.firstDOMProxy.afterShadow
}
