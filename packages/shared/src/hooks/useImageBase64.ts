import { useState } from 'react'
import { useAsyncRetry } from 'react-use'

function readAsDataURL(blob: Blob) {
    return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.addEventListener('load', () => resolve(reader.result as string))
        reader.addEventListener('error', reject)
        reader.readAsDataURL(blob)
    })
}

const cache = new Map<string, string>()

export function useImageBase64(
    key: string,
    url?: string,
    options?: {
        fetch: typeof globalThis.fetch
    },
) {
    const fetch = options?.fetch ?? globalThis.fetch
    const [base64, setBase64] = useState(cache.get(key) ?? '')

    useAsyncRetry(async () => {
        const hit = cache.get(key)
        if (hit) {
            setBase64(hit)
            return
        }

        if (!url || !fetch) return
        const response = await fetch(`https://cors.r2d2.to/?${url}`)
        if (!response) return

        const blob = await response.blob()
        const dataURL = await readAsDataURL(blob)
        cache.set(key, dataURL)
        setBase64(dataURL)
    }, [key, url])

    return base64
}
