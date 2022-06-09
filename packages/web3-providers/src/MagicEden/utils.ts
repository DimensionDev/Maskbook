import { resolveIPFSLink } from '@masknet/web3-shared-evm'

export function toImage(url?: string) {
    if (!url) return ''
    if (url.startsWith('ipfs://')) {
        const cid = url.replace(/^ipfs:\/\//, '')
        return resolveIPFSLink(cid)
    }
    return url
}
