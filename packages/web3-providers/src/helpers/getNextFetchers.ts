import { Duration, createFetchCached, fetchCached } from './fetchCached.js'
import { createFetchSquashed, fetchSquashed } from './fetchSquashed.js'

export interface NextFetchersOptions {
    enableSquash?: boolean
    enableCache?: boolean
    squashExpiration?: number
    cacheDuration?: number
}

export function getNextFetchers({
    enableSquash: squashed = false,
    enableCache: cached = false,
    squashExpiration: squashedExpiration = 600,
    cacheDuration: cachedDuration = Duration.SHORT,
}: NextFetchersOptions = {}) {
    return [
        squashed
            ? createFetchSquashed({
                  expiration: squashedExpiration,
              })
            : fetchSquashed,
        cached
            ? createFetchCached({
                  duration: cachedDuration,
              })
            : fetchCached,
    ]
}
