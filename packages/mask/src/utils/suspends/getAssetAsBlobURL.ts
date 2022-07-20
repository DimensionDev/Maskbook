import { getAssetAsBlobURL as _ } from '@masknet/shared-base'

/**
 * Fetch a file and turn it into blob URL.
 * This function must run in React concurrent mode.
 */
export function getAssetAsBlobURL(url: string | URL) {
    return _(url, async (url: string) => {
        const response = await globalThis.r2d2Fetch(url)
        return response.blob()
    })
}
