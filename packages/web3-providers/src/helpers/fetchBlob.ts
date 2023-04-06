import { fetch } from './fetch.js'
import { getNextFetchers, type NextFetchersOptions } from './getNextFetchers.js'

export async function fetchBlob(
    input: RequestInfo | URL,
    init?: RequestInit,
    options?: NextFetchersOptions,
): Promise<Blob> {
    const response = await fetch(input, init, getNextFetchers(options))
    if (!response.ok) throw new Error('Failed to fetch as Blob.')
    return response.blob()
}
