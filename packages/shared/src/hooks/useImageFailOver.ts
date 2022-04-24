import { useAsync } from 'react-use'
import { findAvailableImageURL } from '@dimensiondev/kit'
import type { AsyncState } from 'react-use/lib/useAsyncFn'

const cache = new Map<string, string>()

/**
 * Request images from different sources and get the image's url of the loaded
 * @param urls the url of different image sources
 * @param suffix the image file path suffix
 */
export function useImageFailOver(urls: readonly string[], suffix: string): AsyncState<string> {
    return useAsync(async () => {
        const cacheKey = `${urls.join()}_${suffix}`
        if (cache.has(cacheKey)) return cache.get(cacheKey)

        try {
            const imgs = urls.map((v) => v + suffix)
            const img = await findAvailableImageURL(imgs)
            const url = urls[imgs.indexOf(img)]
            cache.set(cacheKey, url)
            return url
        } catch {
            return ''
        }
    }, [urls.join(), suffix])
}
