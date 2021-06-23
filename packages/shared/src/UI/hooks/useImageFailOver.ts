import { useAsync } from 'react-use'
import { findAvailableImageURL } from '@dimensiondev/kit'

/**
 * Request images from different sources and get the image's url of the loaded
 * @param urls the url of different image sources
 * @param suffix the image file path suffix
 */
export function useImageFailOver(urls: readonly string[], suffix: string) {
    return useAsync(async () => {
        try {
            const imgs = urls.map((v) => v + suffix)
            const img = await findAvailableImageURL(imgs)
            return urls[imgs.indexOf(img)]
        } catch {
            return ''
        }
    }, [urls.join(''), suffix])
}
