export function isProxyENV() {
    try {
        return process.env.PROVIDER_API_ENV === 'proxy'
    } catch {
        return false
    }
}

export async function fetchJSON<T = unknown>(requestInfo: RequestInfo, requestInit?: RequestInit): Promise<T> {
    const res = await globalThis.fetch(requestInfo, requestInit)
    return res.json()
}
