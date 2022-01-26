export const isProxyENV = process.env.PROVIDER_API_ENV === 'proxy'

export async function fetchJSON<T = unknown>(requestInfo: RequestInfo, requestInit?: RequestInit): Promise<T> {
    const res = await globalThis.fetch(requestInfo, requestInit)
    return res.json()
}
