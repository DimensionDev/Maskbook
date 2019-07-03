import { LiveSelector } from '@holoflows/kit/es/DOM/LiveSelector'
import { PersonIdentifier } from '../../../database/type'
import { useEffect, useState } from 'react'
import { ValueRef, MutationObserverWatcher } from '@holoflows/kit/es'
import Services from '../../service'
import { Person } from '../../../database'

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
    Services.People.resolveIdentityAtFacebook(id)
})
new MutationObserverWatcher(
    myUsernameLiveSelector
        .clone()
        .map(getPersonIdentifierAtFacebook)
        .concat(myUsernameLiveSelectorOnMobile),
)
    .enableSingleMode()
    .setComparer(undefined, (a, b) => a.equals(b))
    .addListener('onAdd', e => assign(e.data.value))
    .addListener('onChange', e => assign(e.data.newValue))
    .startWatch()

const identities = new ValueRef<Person[]>([])
Services.People.queryMyIdentity('facebook.com').then(x => (identities.value = x))
export function useIdentitiesAtFacebook(): Person[] {
    const [currentIdentities, set] = useState(identities.value)
    useEffect(() => identities.addListener(v => set(v)))
    return currentIdentities
}
type link = HTMLAnchorElement | null | undefined
export function getPersonIdentifierAtFacebook(links: link[] | link): PersonIdentifier {
    try {
        // tslint:disable-next-line: no-parameter-reassignment
        if (!Array.isArray(links)) links = [links]
        const [link] = links
        if (link === null || link === undefined) return PersonIdentifier.unknown
        const id = getUserID(link.href)
        if (id) return new PersonIdentifier('facebook.com', id)
    } catch (e) {
        console.error(e)
    }
    return PersonIdentifier.unknown
}
function getUserID(x: string) {
    if (!x) return null
    const relative = !x.startsWith('https://') && !x.startsWith('http://')
    const url = new URL(x, relative ? location.host : undefined)

    if (url.hostname !== 'www.facebook.com' && url.hostname !== 'm.facebook.com') return null
    if (url.pathname.endsWith('.php')) {
        if (!url.search) return null
        const search = new URLSearchParams(url.search)
        return search.get('id')
    }
    return url.pathname.replace(/^\//, '')
}
