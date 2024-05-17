/**
 * Test if a URL is a domain or subdomain of a given domain.
 *
 * `url.endsWith(domain)` is not safe, for example, evil-twitter.com also ends with twitter.com.
 * @param url URL like https://x.com/
 * @param domain A domain like x.com
 * @returns If url is in domain or subdomain.
 */
export function isDomainOrSubdomainOf(url: string, domain: string) {
    if (url.startsWith('https://' + domain)) return true
    if (!URL.canParse(url)) {
        url = 'https://' + url
        if (!URL.canParse(url)) return false
    }
    const { hostname } = new URL(url)
    return hostname === domain || hostname.endsWith('.' + domain)
}
