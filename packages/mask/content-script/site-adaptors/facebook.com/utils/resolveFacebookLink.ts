export function resolveFacebookLink(link: string) {
    // cspell:disable-next-line
    return link.replace(/\?fbclid=[\S\s]*#/, '#')
}
