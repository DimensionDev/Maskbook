import { memoizePromise } from '../../utils/memoize'

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

export function saveAsFile(file: ArrayBuffer, mineType: string, suggestingFileName: string) {
    const blob = new Blob([file], { type: mineType })
    const url = URL.createObjectURL(blob)
    return browser.downloads.download({
        url,
        filename: suggestingFileName,
        saveAs: true,
    })
}
