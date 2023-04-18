import punycode from 'punycode'

const DOMAIN_RE = /\.(eth|bnb|arb)$/

export function isValidDomain(domain?: string) {
    if (!domain) return false
    if (!DOMAIN_RE.test(domain)) return false
    const match = punycode
        .toASCII(domain)
        .toLowerCase()
        .match(/^(?:[a-z0-9](?:[-a-z0-9]*[a-z0-9])?\.)+[a-z0-9][-a-z0-9]*[a-z0-9]$/u)
    return match !== null
}
