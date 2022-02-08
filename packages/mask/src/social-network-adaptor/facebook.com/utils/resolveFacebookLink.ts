import { FACEBOOK_ID } from '../base'

export function resolveFacebookLink(link: string, id: string) {
    // cspell:disable-next-line
    return id === FACEBOOK_ID ? link.replace(/\?fbclid=[\S\s]*#/, '#') : link
}
