import { fetch } from './fetch.js'
import { getNextFetchers, type NextFetchersOptions } from './getNextFetchers.js'

export async function fetchGlobal(
    input: RequestInfo | URL,
    init?: RequestInit,
    options?: NextFetchersOptions,
): Promise<Response> {
    return fetch(input, init, getNextFetchers(options))
}
