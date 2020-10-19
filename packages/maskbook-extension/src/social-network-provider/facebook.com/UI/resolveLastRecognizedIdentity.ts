import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import type { SocialNetworkUI } from '../../../social-network/ui'
import { getProfileIdentifierAtFacebook, getUserID } from '../getPersonIdentifierAtFacebook'
import type { Profile } from '../../../database'
import { isMobileFacebook } from '../isMobile'
import { ProfileIdentifier } from '../../../database/type'

export function resolveLastRecognizedIdentityFacebook(this: SocialNetworkUI) {
    const ref = this.lastRecognizedIdentity
    const self = (isMobileFacebook ? myUsernameLiveSelectorMobile : myUsernameLiveSelectorPC)
        .clone()
        .map((x) => getProfileIdentifierAtFacebook(x, false))
    new MutationObserverWatcher(self)
        .setComparer(undefined, (a, b) => a.identifier.equals(b.identifier))
        .addListener('onAdd', (e) => assign(e.value))
        .addListener('onChange', (e) => assign(e.newValue))
        .startWatch({
            childList: true,
            subtree: true,
            characterData: true,
        })
    function assign(i: part) {
        if (!i.identifier.isUnknown) ref.value = i
    }
    // ? maybe no need of this?
    fetch('/me', { method: 'HEAD' })
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

type part = Pick<Profile, 'identifier' | 'nickname' | 'avatar'>
//#endregion
