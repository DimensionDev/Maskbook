import { Duration } from '../helpers/fetchCached.js'
import { fetchCachedJSON } from '../helpers/fetchJSON.js'

export function fetchFromDSearch<T>(request: RequestInfo | URL, init?: RequestInit) {
    return fetchCachedJSON<T>(request, init, {
        squashExpiration: 0,
        cacheDuration: Duration.THIRTY_MINUTES,
    })
}
