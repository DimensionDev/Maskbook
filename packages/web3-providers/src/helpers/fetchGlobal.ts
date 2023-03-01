import { fetch } from './fetch.js'
import { fetchCached } from './fetchCached.js'
import { fetchSquashed } from './fetchSquashed.js'

export async function fetchGlobal(input: RequestInfo, init?: RequestInit): Promise<Response> {
    return fetch(input, init, [fetchSquashed, fetchCached])
}
