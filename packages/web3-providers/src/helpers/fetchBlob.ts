import { fetch } from './fetch.js'
import { fetchCached } from './fetchCached.js'
import { fetchR2D2 } from './fetchR2D2.js'
import { fetchSquashed } from './fetchSquashed.js'

export async function fetchBlob(input: RequestInfo | URL, init?: RequestInit): Promise<Blob> {
    const response = await fetch(input, init, [fetchR2D2, fetchSquashed, fetchCached])
    if (!response.ok) throw new Error('Failed to fetch as Blob.')
    return response.blob()
}
