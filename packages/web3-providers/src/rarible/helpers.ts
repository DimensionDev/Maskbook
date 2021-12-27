import { RaribleIPFSURL } from './constants'

export function toRaribleImage(url?: string) {
    if (!url) return ''
    return `${RaribleIPFSURL}${url.replace('ipfs://ipfs/', '')}`
}
