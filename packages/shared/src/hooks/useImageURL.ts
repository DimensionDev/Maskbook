const IPFS_PREFIX = 'https://ipfs.io/ipfs'
const CORS_PREFIX = 'https://cors.r2d2.to'

export function useImageURL(url?: string) {
    if (!url) return
    if (url?.startsWith('ipfs://')) {
        return `${IPFS_PREFIX}?${decodeURIComponent(url.replace('ipfs://', ''))}`
    }
    if (url?.startsWith('https://ipfs.io/')) {
        // base64
        const [_, data] = url.match(/ipfs\/(data.*)$/) ?? []
        if (data) return decodeURIComponent(data)

        // plain
        return decodeURIComponent(url)
    }
    if (url?.startsWith('http') && !url.includes('cors.r2d2.to')) {
        return `${CORS_PREFIX}?${url}`
    }
    return url
}
