import { fetch } from './fetch.js'
import { fetchCached } from './fetchCached.js'
import { fetchSquashed } from './fetchSquashed.js'

export async function fetchText(
    input: RequestInfo | URL,
    init?: RequestInit,
    fetchers = [fetchSquashed, fetchCached],
): Promise<string> {
    const response = await fetch(input, init, fetchers)
    if (!response.ok) throw new Error('Failed to fetch as Text.')
    return response.text()
}
