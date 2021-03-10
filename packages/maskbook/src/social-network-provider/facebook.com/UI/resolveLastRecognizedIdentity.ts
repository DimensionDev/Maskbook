import { LiveSelector, MutationObserverWatcher, ValueRef } from '@dimensiondev/holoflows-kit'
import type { SocialNetworkUI } from '../../../social-network/ui'
import type { SocialNetworkUI as Next } from '../../../social-network-next/types'
import { creator } from '../../../social-network-next/utils'
import { getProfileIdentifierAtFacebook, getUserID } from '../getPersonIdentifierAtFacebook'
import { isMobileFacebook } from '../isMobile'
import { ProfileIdentifier } from '../../../database/type'

export const IdentityProviderFacebook: Next.CollectingCapabilities.IdentityResolveProvider = {
    hasDeprecatedPlaceholderName: true,
    lastRecognized: creator.IdentityResolveProviderLastRecognized(),
    start(signal) {
        resolveLastRecognizedIdentityFacebookInner(this.lastRecognized, signal)
    },
}
export function resolveLastRecognizedIdentityFacebook(this: SocialNetworkUI) {
    resolveLastRecognizedIdentityFacebookInner(this.lastRecognizedIdentity)
}
function resolveLastRecognizedIdentityFacebookInner(ref: ValueRef<Value>, signal?: AbortSignal) {
    const self = (isMobileFacebook ? myUsernameLiveSelectorMobile : myUsernameLiveSelectorPC)
        .clone()
        .map((x) => getProfileIdentifierAtFacebook(x, false))
    const watcher = new MutationObserverWatcher(self)
        .setComparer(undefined, (a, b) => a.identifier.equals(b.identifier))
        .addListener('onAdd', (e) => assign(e.value))
        .addListener('onChange', (e) => assign(e.newValue))
        .startWatch({
            childList: true,
            subtree: true,
            characterData: true,
        })
    signal?.addEventListener('abort', () => watcher.stopWatch())
    function assign(i: Value) {
        if (!i.identifier.isUnknown) ref.value = i
    }
    fetch('/me', { method: 'HEAD', signal })
        .then((x) => x.url)
        .then(getUserID)
        .then((id) => id && assign({ ...ref.value, identifier: new ProfileIdentifier('facebook.com', id) }))
}

//#region LS
// Try to resolve my identities
const myUsernameLiveSelectorPC = new LiveSelector()
    .querySelectorAll<HTMLAnchorElement>(
        `[data-pagelet="LeftRail"] > [data-visualcompletion="ignore-dynamic"]:first-child > div:first-child > ul [role="link"]`,
    )

    .filter((x) => x.innerText)
const myUsernameLiveSelectorMobile = new LiveSelector().querySelector<HTMLAnchorElement>(
    '#bookmarks_flyout .mSideMenu > div > ul > li:first-child a, #MComposer a',
)

type Value = Next.CollectingCapabilities.IdentityResolveProvider['lastRecognized']['value']
//#endregion
