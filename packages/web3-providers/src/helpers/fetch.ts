const { fetch: originalFetch } = globalThis

export type Fetcher<T = Response> = (input: RequestInfo | URL, init?: RequestInit, next?: Fetcher) => Promise<T>

export function fetch<T = Response>(input: RequestInfo | URL, init?: RequestInit, fetchers: Fetcher[] = []) {
    if (!fetchers.length) throw new Error('No fetcher found.')
    const fetcher = fetchers.reduce<Fetcher>((ff, f) => (r, i) => f(r, i, ff), originalFetch)
    return fetcher(input, init) as Promise<T>
}
