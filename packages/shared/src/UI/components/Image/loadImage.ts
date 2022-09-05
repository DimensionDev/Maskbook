import { isLocaleResource } from '@masknet/web3-shared-base'

export async function loadImage(url: string) {
    if (url.startsWith('<svg ')) return `data:image/svg+xml;base64,${btoa(url)}`
    if (isLocaleResource(url)) return url
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
        img.addEventListener('load', onload)
        img.addEventListener('error', onerror)
        img.src = url
    }).catch(async () => {
        const response = await fetch(url, {
            cache: 'force-cache',
        })
        if (response.ok) return URL.createObjectURL(await response.blob())
        return
    })
}
