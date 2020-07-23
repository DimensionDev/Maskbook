import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import type { SocialNetworkUI } from '../../../social-network/ui'
import { getProfileIdentifierAtFacebook } from '../getPersonIdentifierAtFacebook'
import type { Profile } from '../../../database'
import { isMobileFacebook } from '../isMobile'

export function resolveLastRecognizedIdentityFacebook(this: SocialNetworkUI) {
    const ref = this.lastRecognizedIdentity
    const self = (isMobileFacebook ? myUsernameLiveSelectorMobile : myUsernameLiveSelectorPC)
        .clone()
        .map((x) => getProfileIdentifierAtFacebook(x, false))
        .enableSingleMode()
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
}

//#region LS
// Try to resolve my identities
const myUsernameLiveSelectorPC = new LiveSelector().querySelector<HTMLAnchorElement>(
    `[aria-label="Facebook"][role="navigation"] [data-click="profile_icon"] a`,
)
const myUsernameLiveSelectorMobile = new LiveSelector().querySelector<HTMLAnchorElement>(
    '#bookmarks_flyout .mSideMenu > div > ul > li:first-child a, #MComposer a',
)

type part = Pick<Profile, 'identifier' | 'nickname' | 'avatar'>
//#endregion
