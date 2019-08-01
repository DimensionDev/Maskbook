import { LiveSelector } from '@holoflows/kit/es/DOM/LiveSelector'
import { MutationObserverWatcher } from '@holoflows/kit/es'
import { PersonIdentifier } from '../../../database/type'
import Services from '../../../extension/service'
import { SocialNetworkUI } from '../../../social-network/ui'
import { getPersonIdentifierAtFacebook } from '../getPersonIdentifierAtFacebook'

export function resolveLastRecognizedIdentityFacebook(this: SocialNetworkUI) {
    const ref = this.lastRecognizedIdentity
    ref.addListener(id => {
        if (id.identifier.isUnknown) return
        Services.People.resolveIdentity(id.identifier)
    })
    new MutationObserverWatcher(
        myUsernameLiveSelectorPC
            .clone()
            .map(x => getPersonIdentifierAtFacebook(x, false))
            .concat(myUsernameLiveSelectorOnMobile),
    )
        .enableSingleMode()
        .setComparer(undefined, (a, b) => a.equals(b))
        .addListener('onAdd', e => assign(e.value))
        .addListener('onChange', e => assign(e.newValue))
        .startWatch()
    function assign(i: PersonIdentifier) {
        if (i.isUnknown) return
        if (i.equals(ref.value.identifier)) return
        ref.value = { identifier: i }
    }
}

//#region LS
// Try to resolve my identities
const myUsernameLiveSelectorPC = new LiveSelector().querySelector<HTMLAnchorElement>(
    `[aria-label="Facebook"][role="navigation"] [data-click="profile_icon"] a`,
)

const myUsernameLiveSelectorOnMobile = new LiveSelector()
    .querySelectorAll('article')
    .map(x => x.dataset.store)
    .map(x => JSON.parse(x).actor_id as number)
    .replace(orig =>
        orig.length
            ? [
                  orig.reduce((previous, current) => {
                      if (location.hostname === 'm.facebook.com' && location.pathname === '/') {
                          if (previous === current) return current
                      }
                      return undefined!
                  }),
              ]
            : [],
    )
    .map(x => x)
    .map(x => new PersonIdentifier('facebook.com', x.toString()))
//#endregion
