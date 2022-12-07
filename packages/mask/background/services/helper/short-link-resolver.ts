import { memoize } from 'lodash-es'
import { memoizePromise } from '@masknet/kit'
import { fetchText } from '@masknet/web3-providers/helpers'

const cache = new Map<string, string>()

async function resolver(u: string): Promise<string | null> {
    if (!u.startsWith('https://t.co/')) return null
    if (cache.has(u)) return cache.get(u)!
    const text = await fetchText(u, {
        redirect: 'error',
        credentials: 'omit',
        referrerPolicy: 'no-referrer',
    })
    const url = text.match(/URL=(.+).><\/noscript/)?.[1]
    if (url) cache.set(u, url)
    return url ?? null
}
/** Resolve a https://t.co/ link to it's real address. */
export const resolveTCOLink = memoizePromise(memoize, resolver, (x) => x)
