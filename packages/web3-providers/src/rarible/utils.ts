import { RaribleIPFSURL } from './constants'

export function toRaribleImage(url?: string) {
    if (!url) return ''
    if (url.startsWith('ipfs://ipfs/')) return url.replace(/^ipfs:\/\/ipfs\//, RaribleIPFSURL)
    return url
}
