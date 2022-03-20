const cache = new Map<string, string>()
/**
 * Fetch a file and turn it into blob URL.
 * This function must run in React concurrent mode.
 */
export function getAssetAsBlobURL(url: string | URL, fetcher: (url: string) => Promise<Blob>) {
    url = url.toString()
    if (!cache.has(url)) throw toBlob(url, fetcher)
    return cache.get(url)!
}
async function toBlob(url: string, fetcher: (url: string) => Promise<Blob>) {
    const blobURL = URL.createObjectURL(await fetcher(url))
    cache.set(url, blobURL)
    return blobURL
}
