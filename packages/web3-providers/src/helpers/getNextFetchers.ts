import { Duration, createFetchCached, fetchCached } from './fetchCached.js'
import { createFetchSquashed, fetchSquashed } from './fetchSquashed.js'

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
    return [
        enableSquash
            ? createFetchSquashed({
                  expiration: squashExpiration,
              })
            : fetchSquashed,
        enableCache
            ? createFetchCached({
                  duration: cacheDuration,
              })
            : fetchCached,
    ]
}
