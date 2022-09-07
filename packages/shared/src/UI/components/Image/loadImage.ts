import { hasIpfsCid, isLocaleResource, resolveIPFSLink, resolveLocalResource } from '@masknet/web3-shared-base'

export async function loadImage(url: string) {
    if (isLocaleResource(url)) return resolveLocalResource(url)
    return new Promise<string>((resolve, reject) => {
        let fixedUrl = url
        if (!/^https?:\/\//.test(url)) {
            if (!hasIpfsCid(url)) {
                // Unknown type, fallback to fetch, aka r2d2Fetch.
                throw new TypeError('Invalid url.')
            }
            fixedUrl = resolveIPFSLink(fixedUrl)!
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
}
