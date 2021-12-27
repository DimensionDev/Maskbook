export async function fetch(url: string) {
    const res = await globalThis.fetch(url)
    return res.blob()
}

export async function fetchJSON<T = unknown>(url: string): Promise<T> {
    const res = await globalThis.fetch(url)
    return res.json()
}
