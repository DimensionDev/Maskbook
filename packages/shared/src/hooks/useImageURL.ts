import { useAsync } from 'react-use'
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
    return attemptUntil<string | null>(
        [
            async () => toBase64(await fetchImageViaDOM(resolveCrossOriginURL(url)!)),
            async () => toBase64(await fetchImageViaDOM(url)),
            async () => toBase64(await fetchImageViaHTTP(url)),
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
