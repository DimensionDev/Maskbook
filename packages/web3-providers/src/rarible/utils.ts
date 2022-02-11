import { resolveIPFSLink } from '@masknet/web3-shared-evm'
export function toRaribleImage(url?: string) {
    if (!url) return ''
    if (url.startsWith('ipfs://ipfs/')) return resolveIPFSLink(url.replace(/^ipfs:\/\/ipfs\//, ''))
    return url
}
