import { fetch } from './fetch.js'
import { fetchCached } from './fetchCached.js'
import { fetchSquashed } from './fetchSquashed.js'
import { captureFetchException } from './captureFetchException.js'

export async function fetchBlob(input: RequestInfo | URL, init?: RequestInit): Promise<Blob> {
    const response = await fetch(input, init, [fetchSquashed, fetchCached])
    if (!response.ok) {
        await captureFetchException(new Request(input, init), response)
        throw new Error('Failed to fetch as Blob.')
    }
    return response.blob()
}
