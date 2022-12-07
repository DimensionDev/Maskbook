const { fetch: originalFetch } = globalThis

export async function fetchText(input: RequestInfo | URL, init?: RequestInit, next = originalFetch): Promise<string> {
    const response = await next(input, init)
    if (!response.ok) throw new Error('Failed to fetch as Text.')
    return response.text()
}
