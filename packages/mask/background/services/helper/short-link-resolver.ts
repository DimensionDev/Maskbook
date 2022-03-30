import { memoizePromise } from '@dimensiondev/kit'

const cache = new Map<string, string>()
async function resolver(u: string): Promise<string | null> {
    if (!u.startsWith('https://t.co/')) return null
    if (cache.has(u)) return cache.get(u)!
    const res = await globalThis.fetch(u, {
        redirect: 'error',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
    })
    const text = await res.text()
    const url = text.match(/URL=(.+).><\/noscript/)?.[1]
    if (url) cache.set(u, url)
    return url ?? null
}
/** Resolve a https://t.co/ link to it's real address. */
export const resolveTCOLink = memoizePromise(resolver, (x) => x)
