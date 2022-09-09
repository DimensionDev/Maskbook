const MAX_IMG_WIDTH = 160
const MAX_IMG_HEIGHT = 160

/**
 * Fetch image by creating an image element.
 * It's not supporting in mv3 on background page.
 * @param url
 * @returns
 */
export function fetchImageByDOM(url: string) {
    return new Promise<Blob | null>((resolve, reject) => {
        const img = document.createElement('img')
        const cleanup = () => {
            img.removeEventListener('load', onload)
            img.removeEventListener('error', reject)
        }
        const onload = () => {
            const canvas = document.createElement('canvas')
            const context = canvas.getContext('2d')
            const w = img.naturalWidth
            const h = img.naturalHeight
            const scale = Math.min(MAX_IMG_WIDTH / w, MAX_IMG_HEIGHT / h)
            canvas.height = MAX_IMG_HEIGHT
            canvas.width = MAX_IMG_WIDTH
            context?.setTransform(scale, 0, 0, scale, canvas.width / 2, canvas.height / 2)
            context?.drawImage(img, -w / 2, -h / 2, w, h)
            canvas.toBlob((b) => resolve(b), 'image/png')
            cleanup()
        }
        const onerror = () => {
            reject()
            cleanup()
        }
        img.decoding = 'async'
        img.crossOrigin = 'Anonymous'
        img.addEventListener('load', onload)
        img.addEventListener('error', onerror)
        img.src = url
    })
}

/**
 * Fetch image by fetching with HTTP request.
 * This manner will constraint by browser safe policy (CORS).
 * @param url
 * @returns
 */
export async function fetchImageByHTTP(url: string) {
    const response = await fetch(url, {
        cache: 'force-cache',
        headers: {
            accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        },
    })
    if (response.ok) return response.blob()
    return
}
