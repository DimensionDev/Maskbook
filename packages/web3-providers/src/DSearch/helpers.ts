import { Duration, fetchCachedJSON } from '../entry-helpers.js'

export function fetchFromDSearch<T>(request: RequestInfo | URL, init?: RequestInit) {
    return fetchCachedJSON<T>(request, init, {
        squashExpiration: 0,
        cacheDuration: Duration.MEDIUM,
    })
}
