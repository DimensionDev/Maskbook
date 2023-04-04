import { fetch } from './fetch.js'
import { fetchSquashed } from './fetchSquashed.js'
import { fetchCached } from './fetchCached.js'

export async function fetchJSON2<T = unknown>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
    const response = await fetch(input, init, [fetchSquashed, fetchCached])
    if (!response.ok && response.status === 404) return {} as T
    if (!response.ok) throw new Error('Failed to fetch as JSON.')
    return response.json()
}
