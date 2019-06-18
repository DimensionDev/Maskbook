import { LiveSelector } from '@holoflows/kit/es/DOM/LiveSelector'
import { PersonIdentifier } from '../../../database/type'
import { useEffect, useState } from 'react'
import { ValueRef, MutationObserverWatcher } from '@holoflows/kit/es'

const myUsername = new LiveSelector().querySelector<HTMLAnchorElement>(
    `[aria-label="Facebook"][role="navigation"] [data-click="profile_icon"] a`,
)
const myUsernameRef = new ValueRef(PersonIdentifier.unknownMyIdentityAtNetwork('facebook.com'))
new MutationObserverWatcher(myUsername.clone().map(getPersonIdentifierAtFacebook))
    .enableSingleMode()
    .setComparer(undefined, (a, b) => a.equals(b))
    .addListener('onAdd', e => (myUsernameRef.value = e.data.value))
    .addListener('onChange', e => (myUsernameRef.value = e.data.newValue))
    .startWatch()
export function usePersonIdentifierAtFacebook(): PersonIdentifier {
    const [currentID, setID] = useState(myUsernameRef.value)
    useEffect(() => myUsernameRef.addListener(id => !id.equals(currentID) && setID(id)), [])
    return currentID
}
export function getPersonIdentifierAtFacebook(link?: HTMLAnchorElement | null): PersonIdentifier {
    if (link === null) return PersonIdentifier.unknown
    // tslint:disable-next-line: no-parameter-reassignment
    if (link === undefined) link = myUsername.evaluateOnce()[0]
    if (!link) return PersonIdentifier.unknown
    const url = link.href
    const after = url.split('https://www.facebook.com/')[1]
    if (!after) return PersonIdentifier.unknown
    // Firefox doesn't support it
    // if (after.match('profile.php')) return after.match(/id=(?<id>\d+)/)!.groups!.id
    if (after.match('profile.php')) return new PersonIdentifier('facebook.com', after.match(/id=(\d+)/)![1])
    else return new PersonIdentifier('facebook.com', after.split('?')[0])
}
