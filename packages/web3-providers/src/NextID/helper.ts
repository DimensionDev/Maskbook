import LRU from 'lru-cache'
import { Result, Ok, Err } from 'ts-results'

const fetchCache = new LRU<string, any>({
    max: 100,
    ttl: 20000,
})

export function deleteCache(key: string) {
    fetchCache.delete(key)
}

export async function fetchJSON<T = unknown>(
    url: string,
    requestInit?: RequestInit,
    enableCache?: boolean,
): Promise<Result<T, string>> {
    type FetchCache = LRU<string, Promise<Response> | T>

    const cached = enableCache ? (fetchCache as FetchCache).get(url) : undefined
    const isPending = cached instanceof Promise

    if (cached && !isPending) {
        return Ok(cached)
    }
    let pendingResponse: Promise<Response>
    if (isPending) {
        pendingResponse = cached
    } else {
        pendingResponse = globalThis.r2d2Fetch(url, requestInit)
        if (enableCache) {
            fetchCache.set(url, pendingResponse)
        }
    }
    const response = await pendingResponse

    const result = await response.clone().json()

    if (result.message || !response.ok) {
        return Err(result.message)
    }
    fetchCache.set(url, result)

    return Ok(result)
}
