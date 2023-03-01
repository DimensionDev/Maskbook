const { fetch: originalFetch } = globalThis

export type Fetcher<T = Response> = (input: RequestInfo | URL, init?: RequestInit, next?: Fetcher) => Promise<T>

export async function fetch(input: RequestInfo | URL, init?: RequestInit, fetchers: Fetcher[] = []): Promise<Response> {
    if (!fetchers.length) throw new Error('No fetcher found.')

    const fetcher = fetchers.reduceRight<Fetcher>((ff, f) => (r, i) => f(r, i, ff), originalFetch)

    // capture exception if bad response or any error occurs
    let hasError = false

    try {
        const response = await fetcher(input, init)
        if (!response.ok) hasError = true
        return response
    } catch (error) {
        hasError = true
        throw error
    } finally {
        if (hasError) {
            const url = new URL(new Request(input, init).url)

            Sentry.captureException(new Error(`Failed to fetch: ${url}`), {
                tags: {
                    source: url.host,
                },
            })
        }
    }
}
