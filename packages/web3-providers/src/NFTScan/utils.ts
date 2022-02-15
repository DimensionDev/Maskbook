import { resolveIPFSLink } from '@masknet/web3-shared-evm'

export function toNonIPFSImage(url?: string) {
    if (!url) return ''
    if (url.startsWith('http') || url.startsWith('data')) return url
    if (url.startsWith('ipfs://')) return resolveIPFSLink(decodeURIComponent(url).replace('ipfs://', ''))
    return resolveIPFSLink(url)
}
