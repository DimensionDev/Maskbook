import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { PersonIdentifier } from '../../../database/type'
import { SocialNetworkUI } from '../../../social-network/ui'
import { getPersonIdentifierAtFacebook } from '../getPersonIdentifierAtFacebook'
import { Person } from '../../../database'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import React from 'react'
import AsyncComponent from '../../../utils/components/AsyncComponent'
import Services from '../../../extension/service'
import { AdditionalContent } from '../../../components/InjectedComponents/AdditionalPostContent'
import { geti18nString } from '../../../utils/i18n'

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

export function resolveLastRecognizedIdentityFacebook(this: SocialNetworkUI) {
    const ref = this.lastRecognizedIdentity
    const self = myUsernameLiveSelectorPC
        .clone()
        .map(x => getPersonIdentifierAtFacebook(x, false))
        .concat(myUsernameLiveSelectorOnMobile)
        .enableSingleMode()
    new MutationObserverWatcher(self)
        .setComparer(undefined, (a, b) => {
            return a.identifier.equals(b.identifier)
        })
        .addListener('onAdd', e => assign(e.value))
        .addListener('onChange', e => assign(e.newValue))
        .startWatch({
            childList: true,
            subtree: true,
            characterData: true,
        })
        .then()
    function assign(i: part) {
        if (!i.identifier.isUnknown) ref.value = i
    }
    {
        let umount: () => void = () => {}
        const self = othersBioLiveSelectorMobile.clone().concat(othersBioLiveSelectorPC)

        const watcher = new MutationObserverWatcher(self)
            .setComparer(undefined, () => false)
            .setDOMProxyOption({
                afterShadowRootInit: { mode: 'closed' },
            })
            .addListener('onAdd', () => {
                umount()
                umount = renderInShadowRoot(<PersonKnown />, renderPoint)
            })
            .startWatch({
                childList: true,
                subtree: true,
                characterData: true,
            })
        const renderPoint = watcher.firstDOMProxy.afterShadow
    }
}

const othersBioLiveSelectorMobile = new LiveSelector().querySelector<HTMLDivElement>(
    '[data-sigil=timeline-cover]:not(:first-child)',
)

const othersBioLiveSelectorPC = new LiveSelector().querySelector<HTMLDivElement>(
    '#intro_container_id > div:first-child',
)

//#region LS
// Try to resolve my identities
const myUsernameLiveSelectorPC = new LiveSelector().querySelector<HTMLAnchorElement>(
    `[aria-label="Facebook"][role="navigation"] [data-click="profile_icon"] a`,
)

type part = Pick<Person, 'identifier' | 'nickname' | 'avatar'>

const myUsernameLiveSelectorOnMobile = new LiveSelector()
    .querySelectorAll('article')
    .map(x => x.dataset.store)
    .map(x => JSON.parse(x).actor_id as number)
    .filter(x => x)
    .replace(orig => {
        if (location.hostname === 'm.facebook.com' && location.pathname.match(/^\/(?:home)?[^/]*$/)) {
            if (orig.every(x => x === orig[0])) return orig
        }
        return []
    })
    .map(x => ({ identifier: new PersonIdentifier('facebook.com', x.toString()) } as part))
//#endregion
