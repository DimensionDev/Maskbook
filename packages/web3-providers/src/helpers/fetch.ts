const { fetch: originalFetch } = globalThis

export type Fetcher = (input: RequestInfo | URL, init?: RequestInit, next?: Fetcher) => Promise<Response>

export function fetch(input: RequestInfo | URL, init?: RequestInit, fetchers: Fetcher[] = []) {
    if (!fetchers.length) throw new Error('No fetcher found.')
    const fetcher = fetchers.reduceRight<Fetcher>((ff, f) => (r, i) => f(r, i, ff), originalFetch)
    return fetcher(input, init)
}
