import LRU from 'lru-cache'
import { Result, Ok, Err } from 'ts-results-es'

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

    const hit = enableCache ? (fetchCache as FetchCache).get(url) : undefined
    const isPending = hit instanceof Promise

    if (hit && !isPending) {
        return Ok(hit)
    }
    let pendingResponse: Promise<Response>
    if (isPending) {
        pendingResponse = hit
    } else {
        pendingResponse = fetch(url, requestInit)
        if (enableCache) {
            fetchCache.set(url, pendingResponse)
        }
    }
    const response = await pendingResponse

    const result = await response.clone().json()

    if (result.message || !response.ok) {
        fetchCache.delete(url)
        return Err(result.message)
    }
    fetchCache.set(url, result)

    return Ok(result)
}
