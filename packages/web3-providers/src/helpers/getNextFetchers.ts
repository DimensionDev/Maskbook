import { curryRight } from 'lodash-es'
import type { Fetcher } from './fetch.js'
import { fetchSquashed } from './fetchSquashed.js'
import { Duration, fetchCached } from './fetchCached.js'

export interface NextFetchersOptions {
    enableSquash?: boolean
    enableCache?: boolean
    squashExpiration?: number
    cacheDuration?: number
}

export function getNextFetchers({
    enableSquash = false,
    enableCache = false,
    squashExpiration = 600,
    cacheDuration = Duration.SHORT,
}: NextFetchersOptions = {}) {
    const fetchers: Fetcher[] = []
    if (enableSquash) fetchers.push(curryRight(fetchSquashed, squashExpiration))
    if (enableCache) fetchers.push(curryRight(fetchCached, cacheDuration))
    return fetchers
}
