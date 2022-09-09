import { useAsync } from 'react-use'
import { isLocaleResource, resolveLocalURL, resolveResourceURL } from '@masknet/web3-shared-base'

function fetchImageFromFE(url: string) {
    return new Promise<string>((resolve, reject) => {
        const img = document.createElement('img')
        const cleanup = () => {
            img.removeEventListener('load', onload)
            img.removeEventListener('error', reject)
        }
        const onload = () => {
            resolve(url)
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

async function fetchImageFromBE(url: string) {
    const response = await fetch(url, {
        cache: 'force-cache',
    })
    if (response.ok) return URL.createObjectURL(await response.blob())
    return
}

export function useImageURL(url?: string) {
    return useAsync(async () => {
        if (!url) return
        if (isLocaleResource(url)) return resolveLocalURL(url)

        const resolvedURL = resolveResourceURL(url)
        if (!resolvedURL) return url

        try {
            return fetchImageFromFE(resolvedURL)
        } catch {
            return fetchImageFromBE(resolvedURL)
        } finally {
            return resolvedURL
        }
    }, [url])
}
