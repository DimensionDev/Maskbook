import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { ProfileIdentifier } from '../../../database/type'
import type { SocialNetworkUI } from '../../../social-network/ui'
import { getProfileIdentifierAtFacebook } from '../getPersonIdentifierAtFacebook'
import type { Profile } from '../../../database'

export function resolveLastRecognizedIdentityFacebook(this: SocialNetworkUI) {
    const ref = this.lastRecognizedIdentity
    const self = myUsernameLiveSelectorPC
        .clone()
        .map((x) => getProfileIdentifierAtFacebook(x, false))
        .concat(myUsernameLiveSelectorOnMobile)
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

type part = Pick<Profile, 'identifier' | 'nickname' | 'avatar'>

const myUsernameLiveSelectorOnMobile = new LiveSelector()
    .querySelectorAll('article')
    .map((x) => x.dataset.store)
    .map((x) => JSON.parse(x).actor_id as number)
    .filter((x) => x)
    .replace((orig) => {
        if (orig.length && location.hostname === 'm.facebook.com' && location.pathname.match(/^\/(?:home)?[^/]*$/)) {
            if (orig.every((x) => x === orig[0])) return [orig[0]]
        }
        return []
    })
    .map((x) => ({ identifier: new ProfileIdentifier('facebook.com', x.toString()) } as part))
//#endregion
