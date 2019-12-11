import React from 'react'
import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import Services from '../../../extension/service'
import { ProfileIdentifier } from '../../../database/type'
import AsyncComponent from '../../../utils/components/AsyncComponent'
import { SocialNetworkUI } from '../../../social-network/ui'
import { geti18nString } from '../../../utils/i18n'
import { AdditionalContent } from '../../../components/InjectedComponents/AdditionalPostContent'

function whoisCurrentPage() {
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

function PersonKnown() {
    const whois = whoisCurrentPage()
    if (!whois) return null

    const complete = <AdditionalContent center title={geti18nString('seen_in_maskbook_database')} />

    type Type = { type: 'self'; provePost: string } | { type: 'others' } | null
    return (
        <AsyncComponent
            promise={async (): Promise<Type> => {
                const profiles = await Services.Identity.queryMyProfiles('facebook.com')
                const myProfile = profiles.find(x => x.identifier.equals(whois))
                if (myProfile) {
                    const prove = await Services.Crypto.getMyProveBio(myProfile.identifier)
                    if (!prove) return null
                    if (
                        othersBioLiveSelector
                            .evaluate()
                            .map(x => x.innerText)
                            .join('')
                            .includes(prove)
                    )
                        return null
                    return { type: 'self', provePost: prove }
                } else {
                    const profile = await Services.Identity.queryProfile(whois)
                    if (!profile.linkedPersona?.fingerprint) return null
                    return { type: 'others' }
                }
            }}
            dependencies={[]}
            awaitingComponent={null}
            completeComponent={({ data }) => {
                if (data === null) return null
                switch (data.type) {
                    case 'self':
                        return (
                            <AdditionalContent
                                hideIcon
                                center
                                title={geti18nString('please_include_proof_your_bio', data.provePost)}
                            />
                        )
                    case 'others':
                        return complete
                }
            }}
            failedComponent={null}
        />
    )
}

export function injectKnownIdentityAtFacebook(this: SocialNetworkUI) {
    const watcher = new MutationObserverWatcher(othersBioLiveSelector)
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
const othersBioLiveSelector = othersBioLiveSelectorMobile.clone().concat(othersBioLiveSelectorPC)
