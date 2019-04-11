import { LiveSelector } from '@holoflows/kit/es/DOM/LiveSelector'

export const myUsername = new LiveSelector().querySelector<HTMLAnchorElement>(
    `[aria-label="Facebook"][role="navigation"] [data-click="profile_icon"] a`,
)
export function getUsername(link?: HTMLAnchorElement | null) {
    // tslint:disable-next-line: no-parameter-reassignment
    if (link === undefined) link = myUsername.evaluateOnce()[0]
    if (link === null) return undefined
    const url = link.href
    const after = url.split('https://www.facebook.com/')[1]
    if (after.match('profile.php')) return after.match(/id=(?<id>\d+)/)!.groups!.id
    else return after.split('?')[0]
}
