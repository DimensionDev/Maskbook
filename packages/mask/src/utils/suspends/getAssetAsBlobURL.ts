import Services from '../../extension/service'
import { getAssetAsBlobURL as _ } from '@masknet/shared-base'

/**
 * Fetch a file and turn it into blob URL.
 * This function must run in React concurrent mode.
 */
export function getAssetAsBlobURL(url: string | URL) {
    return _(url, Services.Helper.fetch)
}
