import { memoizePromise } from '@dimensiondev/kit'

const cache = new Map<string, string>()
async function resolver(u: string) {
    if (!u.startsWith('https://t.co/')) return null
    if (cache.has(u)) return cache.get(u)!
    const res = await globalThis.fetch(u, {
        redirect: 'error',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
    })
    const text = await res.text()
    // TODO: mv3 don't have DOMParser
    const parser = new DOMParser()
    const doc = parser.parseFromString(text, 'text/html')
    const dom = doc.querySelector('noscript > meta') as HTMLMetaElement
    if (!dom) return null
    const [, url] = dom.content.split('URL=')
    if (url) cache.set(u, url)
    return url ?? null
}
/** Resolve a https://t.co/ link to it's real address. */
export const resolveTCOLink = memoizePromise(resolver, (x) => x)
