/** @deprecated Recommend to use r2d2Fetch */
export async function fetch(url: string): Promise<Blob> {
    const res = await globalThis.fetch(url)
    return res.blob()
}

/** @deprecated Recommend to use r2d2Fetch */
export async function fetchJSON(url: string): Promise<unknown> {
    const res = await globalThis.fetch(url)
    return res.json()
}
