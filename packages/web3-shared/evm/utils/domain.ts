import punycode from 'punycode'

export function isValidDomain(domain?: string) {
    if (!domain) return false
    const match = punycode
        .toASCII(domain)
        .toLowerCase()
        .match(/^(?:[a-z0-9](?:[-a-z0-9]*[a-z0-9])?\.)+[a-z0-9][-a-z0-9]*[a-z0-9]$/u)
    return match !== null
}
