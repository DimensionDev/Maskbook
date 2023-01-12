import { fetch } from './fetch.js'
import { fetchCached } from './fetchCached.js'
import { fetchR2D2 } from './fetchR2D2.js'
import { fetchSquashed } from './fetchSquashed.js'

export async function fetchGlobal(input: RequestInfo, init?: RequestInit): Promise<Response> {
    return fetch(input, init, [fetchR2D2, fetchSquashed, fetchCached])
}
