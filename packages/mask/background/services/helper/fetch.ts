export async function fetch(url: string) {
    const res = await globalThis.fetch(url)
    return res.blob()
}

/** @deprecated */
export async function fetchJSON(url: string): Promise<unknown> {
    const res = await globalThis.fetch(url)
    return res.json()
}
