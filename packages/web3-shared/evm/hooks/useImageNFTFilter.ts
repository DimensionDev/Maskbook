import type { ERC721TokenDetailed } from '../types'
import { useAsync } from 'react-use'

// filter out nft with image resource
export function useImageNFTFilter(collectible: ERC721TokenDetailed) {
    return useAsync(async () => {
        if (!collectible.info?.imageURL) return null
        const { pathname } = new URL(collectible.info?.imageURL ?? '')
        if (/\.(gif|svg|png|webp|jpg|jpeg)$/.test(pathname)) return collectible
        if (/\.(mp4|webm|mov|ogg|mp3|wav)$/.test(pathname)) return null
        const contentType = await getContentType(collectible.info?.imageURL ?? '')
        if (contentType.startsWith('image/')) return collectible
        return null
    }, [collectible])
}

async function getContentType(url: string) {
    if (!/^https?:/.test(url)) {
        return ''
    }
    return Promise.race([
        new Promise((resolve) => setTimeout(() => resolve(''), 20000)),
        new Promise((resolve) => {
            fetch(url, { method: 'HEAD', mode: 'cors' })
                .then((response) =>
                    response.status !== 200 ? resolve('') : resolve(response.headers.get('content-type')),
                )
                .catch(() => resolve(''))
        }),
    ]) as Promise<string>
}
