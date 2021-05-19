import { memoizePromise } from '../../utils/memoize'
import { constructRequestPermissionURL } from '../popups'

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

export async function requestBrowserPermission(permission: browser.permissions.Permissions) {
    if (await browser.permissions.contains(permission)) return true
    try {
        return await browser.permissions.request(permission)
    } catch {
        // which means we're on Firefox.
        // Chrome allows permission request from the background.
    }
    const popup = await browser.windows.create({
        height: 600,
        width: 350,
        type: 'popup',
        url: constructRequestPermissionURL(permission),
    })
    return new Promise((resolve) => {
        browser.windows.onRemoved.addListener(function listener(windowID: number) {
            if (windowID === popup.id) {
                resolve(browser.permissions.contains(permission))
                browser.windows.onRemoved.removeListener(listener)
            }
        })
    })
}

export function queryPermission(permission: browser.permissions.Permissions) {
    return browser.permissions.contains(permission)
}
