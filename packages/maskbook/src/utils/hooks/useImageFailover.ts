import { useAsync } from 'react-use'
import { findAvailableImageURL } from '@dimensiondev/kit'

interface ImgCdnPair {
    img: string
    cdn: string
}

export function useImageFailover(imgCdnPairs: readonly ImgCdnPair[]) {
    return useAsync(async () => {
        try {
            const img = await findAvailableImageURL(imgCdnPairs.map((v) => v.img))
            const result = imgCdnPairs.find((v) => v.img === img) as ImgCdnPair
            return result.cdn
        } catch {
            return ''
        }
    })
}
