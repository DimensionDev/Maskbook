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
            canvas.height = img.naturalHeight
            canvas.width = img.naturalWidth
            context?.drawImage(img, 0, 0)
            canvas.toBlob((b) => resolve(b), 'image/jpeg', '0.8')
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
