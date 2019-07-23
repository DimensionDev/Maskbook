import { LiveSelector } from '@holoflows/kit/es/DOM/LiveSelector'
import { PersonIdentifier } from '../../../database/type'
import { ValueRef, MutationObserverWatcher } from '@holoflows/kit/es'
import Services from '../../service'
import { Person } from '../../../database'
import { useValueRef } from '../../../utils/hooks/useValueRef'

// Try to resolve my identities
const myUsernameLiveSelector = new LiveSelector().querySelector<HTMLAnchorElement>(
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
export const myUsernameRef = new ValueRef(PersonIdentifier.unknown)
Object.assign(window, {
    whoAmI: {
        ref: myUsernameRef,
        pc: myUsernameLiveSelector,
        m: myUsernameLiveSelectorOnMobile,
    },
})
function assign(i: PersonIdentifier) {
    if (i.isUnknown) return
    if (i.equals(myUsernameRef.value)) return
    myUsernameRef.value = i
}
myUsernameRef.addListener(id => {
    if (id.isUnknown) return
    Services.People.resolveIdentity(id)
})
new MutationObserverWatcher(
    myUsernameLiveSelector
        .clone()
        .map(x => getPersonIdentifierAtFacebook(x, false))
        .concat(myUsernameLiveSelectorOnMobile),
)
    .enableSingleMode()
    .setComparer(undefined, (a, b) => a.equals(b))
    .addListener('onAdd', e => assign(e.value))
    .addListener('onChange', e => assign(e.newValue))
    .startWatch()

const identities = new ValueRef<Person[]>([])
Services.People.queryMyIdentity('facebook.com').then(x => (identities.value = x))
export function useIdentitiesAtFacebook(): Person[] {
    return useValueRef(identities)
}
type link = HTMLAnchorElement | null | undefined
export function getPersonIdentifierAtFacebook(links: link[] | link, allowCollectInfo: boolean): PersonIdentifier {
    try {
        // tslint:disable-next-line: no-parameter-reassignment
        if (!Array.isArray(links)) links = [links]
        const result = links
            .filter(x => x)
            .map(x => ({ nickname: x!.innerText, id: getUserID(x!.href), dom: x }))
            .filter(x => x.id)
        const { dom, id, nickname } = result[0] || ({} as any)
        if (id) {
            const result = new PersonIdentifier('facebook.com', id)
            if (allowCollectInfo)
                try {
                    const avatar = dom!.closest('.clearfix')!.parentElement!.querySelector('img')!
                    if (avatar.getAttribute('aria-label') === nickname && nickname) {
                        Services.People.updatePersonInfo(result, { nickname, avatarURL: avatar.src })
                    }
                } catch {}
            return result
        }
        return PersonIdentifier.unknown
    } catch (e) {
        console.error(e)
    }
    return PersonIdentifier.unknown
}
export function getUserID(x: string) {
    if (!x) return null
    const relative = !x.startsWith('https://') && !x.startsWith('http://')
    const url = relative ? new URL(x, location.host) : new URL(x)

    if (url.hostname !== 'www.facebook.com' && url.hostname !== 'm.facebook.com') return null
    if (url.pathname.endsWith('.php')) {
        if (!url.search) return null
        const search = new URLSearchParams(url.search)
        return search.get('id')
    }
    return url.pathname.replace(/^\//, '').replace(/\/$/, '')
}
