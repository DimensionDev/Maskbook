import { SocialNetworkID } from '../../../../shared'

export function resolveFacebookLink(link: string, id: string) {
    return id === SocialNetworkID.Facebook ? link.replace(/\?fbclid=[\S\s]*#/, '#') : link
}
