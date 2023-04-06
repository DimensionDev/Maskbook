import { Duration, createFetchCached, fetchCached } from './fetchCached.js'
import { createFetchSquashed, fetchSquashed } from './fetchSquashed.js'

export interface NextFetchersOptions {
    squashed?: boolean
    cached?: boolean
    squashedExpiration?: number
    cachedDuration?: number
}

export function getNextFetchers({
    squashed = false,
    cached = false,
    squashedExpiration = 600,
    cachedDuration = Duration.SHORT,
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
