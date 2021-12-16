import { RaribleIPFSURL } from './constants'

export function toRaribleImage(url?: string) {
    if (!url) return ''
    if (url.includes('ipfs://ipfs/')) return `${RaribleIPFSURL}${url.replace('ipfs://ipfs/', '')}`
    return url
}
