import { useAsync } from 'react-use'
import type { AsyncState } from 'react-use/lib/useAsyncFn'

// filter out nft with image resource
export function useImageChecker(url: string | undefined): AsyncState<boolean> {
    return useAsync(async () => {
        if (!url) return false
        const { pathname } = new URL(url)
        if (/\.(gif|svg|png|webp|jpg|jpeg)$/.test(pathname)) return true
        if (/\.(mp4|webm|mov|ogg|mp3|wav)$/.test(pathname)) return false
        const contentType = await getContentType(url)
        return contentType.startsWith('image/')
    }, [url])
}

async function getContentType(url: string) {
    if (!/^https?:/.test(url)) {
        return ''
    }
    return Promise.race([
        new Promise((resolve) => setTimeout(() => resolve(''), 20000)),
        new Promise((resolve) => {
            fetch(url, { method: 'HEAD', mode: 'cors' })
                .then((response) =>
                    response.status !== 200 ? resolve('') : resolve(response.headers.get('content-type')),
                )
                .catch(() => resolve(''))
        }),
    ]) as Promise<string>
}
