import { useAsync } from 'react-use'
import { findAvailableImageURL } from '@dimensiondev/kit'

export function useImageFailover(cdns: readonly string[], imgSuffix: string) {
    return useAsync(async () => {
        try {
            const imgs = cdns.map((v) => v + imgSuffix)
            const img = await findAvailableImageURL(imgs)
            return cdns[imgs.indexOf(img)]
        } catch {
            return ''
        }
    })
}
