import { LiveSelector, MutationObserverWatcher } from '@holoflows/kit'
import { PersonIdentifier } from '../../../database/type'
import { SocialNetworkUI } from '../../../social-network/ui'
import { getPersonIdentifierAtFacebook } from '../getPersonIdentifierAtFacebook'
import { Person } from '../../../database'

export function resolveLastRecognizedIdentityFacebook(this: SocialNetworkUI) {
    const ref = this.lastRecognizedIdentity
    const self = myUsernameLiveSelectorPC
        .clone()
        .map(x => getPersonIdentifierAtFacebook(x, false))
        .concat(myUsernameLiveSelectorOnMobile)
        .enableSingleMode()
    new MutationObserverWatcher(self)
        .enableSingleMode()
        .setComparer(undefined, (a, b) => a.identifier.equals(b.identifier))
        .addListener('onAdd', e => assign(e.value))
        .addListener('onChange', e => assign(e.newValue))
        .startWatch()
        .then()
    function assign(i: part) {
        if (i.identifier.isUnknown) throw new Error('failed to recognize user id')
        ref.value = i
    }
}

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
    .map(x => ({ identifier: new PersonIdentifier('facebook.com', x.toString()) } as part))
//#endregion
