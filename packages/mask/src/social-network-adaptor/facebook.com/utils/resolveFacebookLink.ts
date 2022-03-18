import { EnhanceableSite } from '@masknet/shared-base'

export function resolveFacebookLink(link: string, id: string) {
    return id === EnhanceableSite.Facebook ? link.replace(/\?fbclid=[\S\s]*#/, '#') : link
}
