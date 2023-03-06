import { fetch } from './fetch.js'
import { fetchSquashed } from './fetchSquashed.js'
import { fetchCached } from './fetchCached.js'
import { captureFetchException } from './captureFetchException.js'

export async function fetchJSON<T = unknown>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
    const response = await fetch(input, init, [fetchSquashed, fetchCached])
    if (!response.ok) {
        captureFetchException(new Request(input, init), response)
        throw new Error('Failed to fetch as JSON.')
    }
    return response.json()
}
