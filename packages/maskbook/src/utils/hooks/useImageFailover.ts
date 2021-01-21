import { useAsync } from 'react-use'
import { findAvailableImageURL } from '@dimensiondev/kit'

export function useImageFailover(urls: readonly string[], suffix: string) {
    return useAsync(async () => {
        try {
            const imgs = urls.map((v) => v + suffix)
            const img = await findAvailableImageURL(imgs)
            return urls[imgs.indexOf(img)]
        } catch {
            return ''
        }
    })
}
