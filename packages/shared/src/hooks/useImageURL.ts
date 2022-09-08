import { useAsync } from 'react-use'
import { hasIPFS_CID, isLocaleResource, resolveIPFSLink, resolveLocalResource } from '@masknet/web3-shared-base'

export function useImageURL(url?: string) {
    return useAsync(async () => {
        if (!url) return
        if (isLocaleResource(url)) return resolveLocalResource(url)
        return new Promise<string>((resolve, reject) => {
            const startsWithHTTPS = /^https?:\/\//.test(url)
            const hasCID = hasIPFS_CID(url)

            // Unknown type, fallback to fetch, aka. r2d2Fetch.
            if (!startsWithHTTPS && !hasCID) throw new TypeError('Invalid url.')

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
            img.src = hasCID ? resolveIPFSLink(url)! : url
        }).catch(async () => {
            const response = await fetch(url, {
                cache: 'force-cache',
            })
            if (response.ok) return URL.createObjectURL(await response.blob())
            return
        })
    }, [url])
}
