import { fetch } from './fetch.js'
import { fetchCached } from './fetchCached.js'
import { fetchSquashed } from './fetchSquashed.js'

export async function fetchBlob(
    input: RequestInfo | URL,
    init?: RequestInit,
    fetchers = [fetchSquashed, fetchCached],
): Promise<Blob> {
    const response = await fetch(input, init, fetchers)
    if (!response.ok) throw new Error('Failed to fetch as Blob.')
    return response.blob()
}
