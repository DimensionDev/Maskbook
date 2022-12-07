const { fetch: originalFetch } = globalThis

export async function fetchBlob(input: RequestInfo | URL, init?: RequestInit, next = originalFetch): Promise<Blob> {
    const response = await next(input, init)
    if (!response.ok) throw new Error('Failed to fetch as Blob.')
    return response.blob()
}
