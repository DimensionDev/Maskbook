import urlcat from 'urlcat'

const IPFS_PREFIX = 'https://ipfs.io/ipfs'
const CORS_PREFIX = 'https://cors.r2d2.to'

export function useImageURL(url?: string) {
    if (!url) return
    if (url?.startsWith('https://ipfs.io/') || url?.startsWith('ipfs://')) {
        const [hash] = url.match(/Qm[1-9A-HJ-NP-Za-km-z]{44}/) ?? []
        if (hash) return urlcat(IPFS_PREFIX, hash)
        const [_, data] = url.match(/ipfs\/(data.*)$/) ?? []
        if (data) return decodeURIComponent(data)
    }
    if (url?.startsWith('http') && !url.includes('cors.r2d2.to')) {
        return `${CORS_PREFIX}?${url}`
    }
    return url
}
