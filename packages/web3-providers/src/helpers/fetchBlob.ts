import { fetch, type Fetcher } from './fetch.js'
import { fetchCached } from './fetchCached.js'
import { fetchSquashed } from './fetchSquashed.js'

export async function fetchBlob(input: RequestInfo | URL, init?: RequestInit, fetcher?: Fetcher): Promise<Blob> {
    const response = await fetch(input, init, fetcher ? [fetcher] : [fetchSquashed, fetchCached])
    if (!response.ok) throw new Error('Failed to fetch as Blob.')
    return response.blob()
}
