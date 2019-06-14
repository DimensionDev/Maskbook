import { LiveSelector } from '@holoflows/kit/es/DOM/LiveSelector'
import { PersonIdentifier } from '../../../database/type'

export const myUsername = new LiveSelector().querySelector<HTMLAnchorElement>(
    `[aria-label="Facebook"][role="navigation"] [data-click="profile_icon"] a`,
)
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
