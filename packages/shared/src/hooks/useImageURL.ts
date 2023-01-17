import { useAsync } from 'react-use'
import LRU from 'lru-cache'
import {
    attemptUntil,
    fetchImageViaDOM,
    fetchImageViaHTTP,
    isLocaleResource,
    resolveCrossOriginURL,
    resolveLocalURL,
    resolveResourceURL,
} from '@masknet/web3-shared-base'

async function toBase64(blob: Blob | null | undefined) {
    if (!blob) throw new Error('Failed to create image URL.')
    const text = await blob.text()
    if (text.startsWith('<svg ')) return resolveLocalURL(text)
    return URL.createObjectURL(blob)
}

function fetchImage(url: string) {
    const resolvedURL = resolveCrossOriginURL(url)!

    return attemptUntil<string | null>(
        [
            async () => toBase64(await fetchImageViaDOM(resolvedURL)),
            async () => toBase64(await fetchImageViaDOM(url)),
            async () => toBase64(await fetchImageViaHTTP(resolvedURL)),
            async () => toBase64(await fetchImageViaHTTP(url)),
        ],
        url,
    )
}

const cache = new LRU<string, string | Promise<string>>({
    max: 2000,
})

/**
 * useImageURL will memorize loaded image at runtime, with url as key
 *
 * @param {string} url
 */
export function useImageURL(url?: string) {
    return useAsync(async () => {
        if (!url) return
        const hit = cache.get(url)
        if (hit) return hit
        if (isLocaleResource(url)) {
            const resolved = resolveLocalURL(url)
            cache.set(url, resolved)
            return resolved
        }

        const resolvedURL = resolveResourceURL(url)
        if (!resolvedURL) return url

        // Delete the cached if fails to fetch, so that we can try again.
        const pending = fetchImage(resolvedURL).then(
            (fetched) => {
                if (fetched) {
                    cache.set(url, fetched)
                    return fetched
                }
                throw new Error('Failed to fetch')
            },
            () => {
                cache.delete(url)
                return resolvedURL
            },
        )
        cache.set(url, pending)

        return pending
    }, [url])
}
