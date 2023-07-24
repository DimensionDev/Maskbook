import type { Fetcher } from './fetch.js'
import { fetchSquashed } from './fetchSquashed.js'
import { fetchCached } from './fetchCached.js'

export interface NextFetchersOptions {
    squashExpiration?: number
    cacheDuration?: number
    resolver?: (request: Request) => string
}

export function getNextFetchers({ squashExpiration = 0, cacheDuration = 0 }: NextFetchersOptions = {}) {
    const fetchers: Fetcher[] = []
    if (squashExpiration > 0) fetchers.push((...args) => fetchSquashed(...args, squashExpiration))
    if (cacheDuration > 0) fetchers.push((...args) => fetchCached(...args, cacheDuration))
    return fetchers
}
