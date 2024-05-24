import Services from '#services'

/**
 * Download given url return as Blob
 */
export async function downloadUrl(url: string) {
    try {
        if (url.startsWith(browser.runtime.getURL(''))) {
            return await Services.Helper.fetchBlob(url)
        }
    } catch {}
    const res = await fetch(url)
    if (!res.ok) throw new Error('Fetch failed.')
    return res.blob()
}
