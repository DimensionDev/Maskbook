export function resolveFacebookLink(link: string) {
    return link.replace(/\?fbclid=[\S\s]*#/, '#')
}
