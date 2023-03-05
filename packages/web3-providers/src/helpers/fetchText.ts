import { fetch } from './fetch.js'
import { fetchCached } from './fetchCached.js'
import { fetchSquashed } from './fetchSquashed.js'
import { captureFetchException } from './captureFetchException.js'

export async function fetchText(input: RequestInfo | URL, init?: RequestInit): Promise<string> {
    const response = await fetch(input, init, [fetchSquashed, fetchCached])
    if (!response.ok) {
        captureFetchException(new Request(input, init), response)
        throw new Error('Failed to fetch as Text.')
    }
    return response.text()
}
