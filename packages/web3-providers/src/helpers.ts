export async function fetchJSON<T = unknown>(requestInfo: RequestInfo, requestInit?: RequestInit): Promise<T> {
    const res = await globalThis.fetch(requestInfo, requestInit)
    if (res.status === 404) return {} as T
    return res.json()
}
