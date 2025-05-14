import punycode from 'punycode'

// cspell:ignore binanceus klever kresus taiko
const NAME_SERVICE_RE =
    /\.(eth|bnb|arb|lens|zeta|mode|taiko|mint|x|polygon|nft|crypto|blockchain|bitcoin|dao|888|wallet|binanceus|hi|klever|kresus|anime|manga|go|zil)$/
const DOMAIN_RE = /^(?:[a-z0-9](?:[-a-z0-9]*[a-z0-9])?\.)+[a-z0-9][-a-z0-9]*[a-z0-9]$/u
const ENS_SUBDOMAIN_RE = /\[.{64}?\]\.(?:[a-z0-9](?:[-a-z0-9]*[a-z0-9])?\.)+[a-z0-9][-a-z0-9]*[a-z0-9]$/u

export function isValidDomain(domain?: string) {
    if (!domain) return false
    domain = domain.toLowerCase()
    if (!NAME_SERVICE_RE.test(domain)) return false
    const ascii = punycode.toASCII(domain)
    const result = DOMAIN_RE.test(ascii)
    if (!result) return isEnsSubdomain(domain)
    return result
}

export function isEnsSubdomain(domain: string) {
    if (!domain) return false
    domain = domain.toLowerCase()
    if (!domain.endsWith('.eth')) return false
    const ascii = punycode.toASCII(domain)
    const result = ENS_SUBDOMAIN_RE.test(ascii)
    return result
}
