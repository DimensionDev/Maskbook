import { fetch } from './fetch.js'
import { Duration } from './fetchCached.js'
import { getNextFetchers, type NextFetchersOptions } from './getNextFetchers.js'

export async function fetchJSON<T = unknown>(
    input: RequestInfo | URL,
    init?: RequestInit,
    options?: NextFetchersOptions,
): Promise<T> {
    const response = await fetch(input, init, getNextFetchers(options))
    if (!response.ok) throw new Error('Failed to fetch as JSON.')
    return response.json()
}

export async function fetchSquashedJSON<T = unknown>(
    input: RequestInfo | URL,
    init?: RequestInit,
    options?: NextFetchersOptions,
): Promise<T> {
    return fetchJSON<T>(input, init, {
        squashExpiration: 600,
        ...options,
    })
}

export async function fetchCachedJSON<T = unknown>(
    input: RequestInfo | URL,
    init?: RequestInit,
    options?: NextFetchersOptions,
): Promise<T> {
    return fetchJSON<T>(input, init, {
        squashExpiration: 600,
        cacheDuration: Duration.SHORT,
        ...options,
    })
}
