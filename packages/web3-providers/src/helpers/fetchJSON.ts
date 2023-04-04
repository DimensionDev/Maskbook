import { fetch } from './fetch.js'
import { fetchSquashed } from './fetchSquashed.js'
import { fetchCached } from './fetchCached.js'

export async function fetchJSON<T = unknown>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
    const response = await fetch(input, init, [fetchSquashed, fetchCached])
    if (!response.ok && response.status !== 404) throw new Error('Failed to fetch as JSON.')
    if (!response.ok && response.status === 404) return {} as T
    return response.json()
}
