import { Duration, fetchJSON } from '../entry-helpers.js'

export function fetchFromDSearch<T>(request: RequestInfo | URL, init?: RequestInit) {
    return fetchJSON<T>(request, init, {
        enableCache: true,
        cacheDuration: Duration.MEDIUM,
    })
}
