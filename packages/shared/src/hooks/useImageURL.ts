import { useAsync } from 'react-use'
import {
    attemptUntil,
    fetchImageByDOM,
    fetchImageByHTTP,
    isLocaleResource,
    resolveCrossOriginURL,
    resolveLocalURL,
    resolveResourceURL,
} from '@masknet/web3-shared-base'

function toBase64(blob: Blob | null | undefined) {
    if (!blob) throw new Error('Failed to create image URL.')
    return URL.createObjectURL(blob)
}

function fetchImage(url: string) {
    return attemptUntil<string | null>(
        [
            async () => toBase64(await fetchImageByDOM(resolveCrossOriginURL(url)!)),
            async () => toBase64(await fetchImageByDOM(url)),
            async () => toBase64(await fetchImageByHTTP(url)),
        ],
        url,
    )
}

export function useImageURL(url?: string) {
    return useAsync(async () => {
        if (!url) return
        if (isLocaleResource(url)) return resolveLocalURL(url)

        const resolvedURL = resolveResourceURL(url)
        if (!resolvedURL) return url

        try {
            return fetchImage(resolvedURL)
        } catch {
            return resolvedURL
        }
    }, [url])
}
