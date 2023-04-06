import { fetch } from './fetch.js'
import { getNextFetchers, type NextFetchersOptions } from './getNextFetchers.js'

export async function fetchJSON<T = unknown>(
    input: RequestInfo | URL,
    init?: RequestInit,
    options?: NextFetchersOptions,
): Promise<T> {
    const response = await fetch(input, init, getNextFetchers(options))
    if (!response.ok) throw new Error('Failed to fetch as JSON.')
    return response.json()
}
