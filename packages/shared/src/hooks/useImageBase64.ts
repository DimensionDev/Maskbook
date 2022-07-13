import { useState } from 'react'
import LRUCache from 'lru-cache'
import { useAsyncRetry } from 'react-use'

function readAsDataURL(blob: Blob) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.addEventListener('load', () => resolve(reader.result as string))
        reader.addEventListener('error', reject)
        reader.readAsDataURL(blob)
    })
}

const cache = new LRUCache<string, string | Promise<Response>>({
    max: 500,
    ttl: 300_000,
})
const responseToBase64 = async (response: Response) => {
    const blob = await response.blob()
    const dataURL = await readAsDataURL(blob)
    return dataURL
}

export function useAccessibleUrl(
    key = '',
    url?: string,
    options?: {
        fetch: typeof globalThis.fetch
    },
) {
    const fetch = options?.fetch ?? globalThis.fetch
    const [availableUrl, setAvailableUrl] = useState(() => {
        const hit = cache.get(key)
        return typeof hit === 'string' ? hit : ''
    })

    useAsyncRetry(async () => {
        if (!key) return
        const hit = cache.get(key)
        if (typeof hit === 'string') {
            setAvailableUrl(hit)
            return
        } else if (hit instanceof Promise) {
            setAvailableUrl(await responseToBase64((await hit).clone()))
            return
        }

        if (!url || !fetch) return
        const fetchingTask = fetch(`https://cors.r2d2.to/?${url}`)
        cache.set(key, fetchingTask)
        const response = await fetchingTask
        if (!response.ok) {
            cache.delete(key)
            return
        }

        const dataURL = await responseToBase64(response)
        cache.set(key, dataURL)
        setAvailableUrl(dataURL)
    }, [key, url])

    return availableUrl
}
