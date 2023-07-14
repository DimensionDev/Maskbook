const unstoppableDomains = ['.crypto', '.nft', '.x', '.wallet', '.bitcoin', '.dao', '.888', '.zil', '.blockchain']
export function getDomainSystem(domain?: string) {
    if (!domain) return 'unknown'
    if (domain.endsWith('.lens') || domain === 'lensprotocol' || domain === '@lensprotocol') return 'lens'
    if (domain.endsWith('.eth')) return 'ENS'
    if (domain.endsWith('.bit')) return 'dotbit'
    if (domain.endsWith('.bnb')) return 'space_id'
    const ext = domain.slice(domain.lastIndexOf('.'))
    if (unstoppableDomains.includes(ext)) return 'unstoppabledomains'
    return 'unknown'
}
