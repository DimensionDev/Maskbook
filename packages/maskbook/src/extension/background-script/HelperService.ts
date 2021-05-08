import { memoizePromise } from '../../utils/memoize'
import { getHostPermissionFieldFromURL } from '../popups/PermissionAwareRedirect/utils'

const cache = new Map<string, string>()
export const resolveTCOLink = memoizePromise(
    async (u: string) => {
        if (!u.startsWith('https://t.co/')) return null
        if (cache.has(u)) return cache.get(u)!
        const req = await globalThis.fetch(u, {
            redirect: 'error',
            credentials: 'omit',
            referrerPolicy: 'no-referrer',
        })
        const text = await req.text()
        const parser = new DOMParser()
        const doc = parser.parseFromString(text, 'text/html')
        const dom = doc.querySelector('noscript > meta') as HTMLMetaElement
        if (!dom) return null
        const [, url] = dom.content.split('URL=')
        if (url) cache.set(u, url)
        return url ?? null
    },
    (x) => x,
)

export function fetch(url: string) {
    return globalThis.fetch(url).then((x) => x.blob())
}

export function saveAsFileFromUrl(url: string, fileName = '') {
    browser.downloads.download({
        url,
        filename: fileName,
        saveAs: true,
    })
}

export function saveAsFileFromBuffer(file: BufferSource, mimeType: string, fileName = '') {
    const blob = new Blob([file], { type: mimeType })
    const url = URL.createObjectURL(blob)
    saveAsFileFromUrl(url, fileName)
}

export function openDialogPopup(url: string) {
    browser.windows.create({
        type: 'popup',
        width: 400,
        height: 600,
        url: browser.runtime.getURL('/popups.html#' + url),
    })
}
export async function enableSDK(url: string) {
    sessionStorage.setItem('sdk:' + getHostPermissionFieldFromURL(url), '1')
}
export function isSDKEnabled(url: string) {
    return !!sessionStorage.getItem('sdk:' + getHostPermissionFieldFromURL(url))
}
