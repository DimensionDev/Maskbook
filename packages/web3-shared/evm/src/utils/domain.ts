import urlcat from 'urlcat'
import punycode from 'punycode'
import { ChainId } from '../types'

export function isValidDomain(domain?: string) {
    if (!domain || !domain.includes('.eth')) return false
    const match = punycode
        .toASCII(domain)
        .toLowerCase()
        .match(/^(?:[a-z0-9](?:[-a-z0-9]*[a-z0-9])?\.)+[a-z0-9][-a-z0-9]*[a-z0-9]$/u)
    return match !== null
}

export function resolveDomainLink(chainId: ChainId, domain: string): string {
    if (!domain) return domain
    if (chainId === ChainId.Mainnet) return urlcat('https://app.ens.domains/name/:domain/details', { domain })
    return ''
}
