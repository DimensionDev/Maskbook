export async function fetch(url: string) {
    const res = await globalThis.fetch(url)
    return res.blob()
}

export async function fetchJSON(url: string): Promise<unknown> {
    const res = await globalThis.fetch(url)
    return res.json()
}
