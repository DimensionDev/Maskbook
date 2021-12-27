import { FACEBOOK_ID } from '../base'

export function resolveFacebookLink(link: string, id: string) {
    return id === FACEBOOK_ID ? link.replace(/\?fbclid=[\S\s]*#/, '#') : link
}
