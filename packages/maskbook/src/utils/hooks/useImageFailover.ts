import { useAsync } from 'react-use'

interface ImgCdnPair {
    img: string
    cdn: string
}

export function useImageFailover(imgCdnPairs: readonly ImgCdnPair[]) {
    return useAsync(() => {
        return new Promise((resolve) => {
            const image = new Image()
            const innerImgCdnPairs = [...imgCdnPairs]
            let imgCdnPair: ImgCdnPair
            image.addEventListener('error', () => {
                if (innerImgCdnPairs.length === 0) resolve('')
                imgCdnPair = innerImgCdnPairs.shift()!
                image.src = imgCdnPair.img
            })
            image.addEventListener('load', () => {
                resolve(imgCdnPair.cdn)
            })
            if (innerImgCdnPairs.length === 0) resolve('')
            imgCdnPair = innerImgCdnPairs.shift()!
            image.src = imgCdnPair.img
        })
    })
}
