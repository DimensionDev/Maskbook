import { fetch, type Fetcher } from './fetch.js'
import { fetchCached } from './fetchCached.js'
import { fetchSquashed } from './fetchSquashed.js'

export async function fetchText(input: RequestInfo | URL, init?: RequestInit, fetcher?: Fetcher): Promise<string> {
    const response = await fetch(input, init, fetcher ? [fetcher] : [fetchSquashed, fetchCached])
    if (!response.ok) throw new Error('Failed to fetch as Text.')
    return response.text()
}
