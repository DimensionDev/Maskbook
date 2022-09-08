import { useAsync } from 'react-use'
import { hasIPFS_CID, isLocaleResource, resolveIPFS_URL, resolveLocalResource } from '@masknet/web3-shared-base'

// From manifest.json.
const ACCESSIBLE_ORIGINS = [
    'https://gateway.ipfscdn.io',
    'https://logo.nftscan.com',
    'https://imagedelivery.net',
    'https://raw.githubusercontent.com/dimensiondev',
]

export function useImageURL(url?: string) {
    return useAsync(async () => {
        if (!url) return
        if (isLocaleResource(url)) return resolveLocalResource(url)
        return new Promise<string>((resolve, reject) => {
            const startsWithHTTPS = /^https?:\/\//.test(url)
            const hasCID = hasIPFS_CID(url)

            let fixedUrl = url
            if (!startsWithHTTPS) {
                if (!hasCID) {
                    // Unknown type, fallback to fetch, aka r2d2Fetch.
                    throw new TypeError('Invalid url.')
                }
                fixedUrl = resolveIPFS_URL(fixedUrl)!
            }
            if (!ACCESSIBLE_ORIGINS.some((x) => fixedUrl.startsWith(x))) {
                throw new TypeError(
                    `${origin} is not accessible origin, consider add it to web_accessible_resources field of manifest.json`,
                )
            }

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
            img.addEventListener('load', onload)
            img.addEventListener('error', onerror)
            img.src = fixedUrl
        }).catch(async () => {
            const response = await fetch(url, {
                cache: 'force-cache',
            })
            if (response.ok) return URL.createObjectURL(await response.blob())
            return
        })
    }, [url])
}
