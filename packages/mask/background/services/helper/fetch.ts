export async function fetch(input: RequestInfo, init?: RequestInit) {
    const response = await globalThis.fetch(input, init)
    return response.blob()
}

export async function fetchJSON<T = unknown>(input: RequestInfo, init?: RequestInit): Promise<T> {
    const response = await globalThis.fetch(input, init)
    return response.json()
}
