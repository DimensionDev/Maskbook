import { isDomainOrSubdomainOf } from './domain-test.js'

/**
 * Migrate twitter.com (or not) to x.com based on the current hostname.
 * @param url URL that might includes "x.com" or "twitter.com"
 * @returns
 */
export function twitterDomainMigrate(url: string) {
    if (!URL.canParse(url)) return url
    if (typeof location !== 'object') return url
    const u = new URL(url)
    if (isDomainOrSubdomainOf(location.href, 'x.com')) {
        if (u.hostname === 'twitter.com') {
            u.hostname = 'x.com'
        } else if (u.hostname.endsWith('.twitter.com')) {
            u.hostname = u.hostname.replace(/\.twitter\.com$/, '.x.com')
        }
        return u.href
    }
    if (isDomainOrSubdomainOf(location.href, 'twitter.com')) {
        if (u.hostname === 'x.com') {
            u.hostname = 'twitter.com'
        } else if (u.hostname.endsWith('.x.com')) {
            u.hostname = u.hostname.replace(/\.x\.com$/, '.twitter.com')
        }
    }
    return url
}
