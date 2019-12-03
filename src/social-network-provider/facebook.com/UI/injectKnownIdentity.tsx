import React from 'react'
import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import Services from '../../../extension/service'
import { PersonIdentifier } from '../../../database/type'
import AsyncComponent from '../../../utils/components/AsyncComponent'
import { SocialNetworkUI } from '../../../social-network/ui'
import { geti18nString } from '../../../utils/i18n'
import { AdditionalContent } from '../../../components/InjectedComponents/AdditionalPostContent'

function whoisCurrentPage() {
    if (location.pathname === '/profile.php') {
        try {
            const id = new URLSearchParams(location.search).get('id')
            if (!id) return null
            return new PersonIdentifier('facebook.com', id)
        } catch {}
    }
    try {
        const id = location.pathname.substr(1)
        return new PersonIdentifier('facebook.com', id)
    } catch {}
    return null
}

function PersonKnown() {
    const whois = whoisCurrentPage()
    if (!whois) return null

    const complete = <AdditionalContent center title={geti18nString('seen_in_maskbook_database')} />

    return (
        <AsyncComponent
            promise={() =>
                Services.People.queryPerson(whois).then(p => {
                    if (!p.fingerprint) throw new TypeError('public key not found')
                })
            }
            dependencies={[]}
            awaitingComponent={null}
            completeComponent={complete}
            failedComponent={null}
        />
    )
}

export function injectKnownIdentityAtFacebook(this: SocialNetworkUI) {
    const self = othersBioLiveSelectorMobile.clone().concat(othersBioLiveSelectorPC)

    const watcher = new MutationObserverWatcher(self)
        .setDOMProxyOption({
            afterShadowRootInit: { mode: 'closed' },
        })
        .useForeach(() => {
            const umount = renderInShadowRoot(<PersonKnown />, renderPoint)
            return umount
        })
        .startWatch({
            childList: true,
            subtree: true,
            characterData: true,
        })
    const renderPoint = watcher.firstDOMProxy.afterShadow
}

const othersBioLiveSelectorMobile = new LiveSelector().querySelector<HTMLDivElement>(
    '[data-sigil=timeline-cover]:not(:first-child)',
)

const othersBioLiveSelectorPC = new LiveSelector().querySelector<HTMLDivElement>(
    '#intro_container_id > div:first-child',
)
