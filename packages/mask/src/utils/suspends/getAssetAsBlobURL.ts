import Services from '../../extension/service'

const cache = new Map<string, string>()
/**
 * Fetch a file and turn it into blob URL.
 * This function must run in React concurrent mode.
 */
export function getAssetAsBlobURL(url: string | URL) {
    url = url.toString()
    if (!cache.has(url)) throw toBlob(url)
    return cache.get(url)!
}
async function toBlob(url: string) {
    const blobURL = URL.createObjectURL(await Services.Helper.fetch(url))
    cache.set(url, blobURL)
    return blobURL
}
