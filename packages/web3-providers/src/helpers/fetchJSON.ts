const { fetch: originalFetch } = globalThis

export async function fetchJSON<T = unknown>(
    input: RequestInfo | URL,
    requestInit?: RequestInit,
    next = originalFetch,
): Promise<T> {
    const response = await next(input, requestInit)
    if (!response.ok) throw new Error('Failed to fetch as JSON.')
    return response.json()
}
