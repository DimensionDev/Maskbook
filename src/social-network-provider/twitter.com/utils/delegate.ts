/**
 * @desc
 *  this file contains utils that used to
 *  delegate some tasks to foreground by background.
 *  we call foreground tabs 'worker' here.
 */
import { twitterUrl } from './url'
import { shuffle } from 'lodash-es'

export const workerAllocate = async () => {
    const tab = await browser.tabs.query({
        url: [twitterUrl.anyHostUrl, twitterUrl.anyHostUrlMobile],
        pinned: false,
    })
    if (tab) return shuffle(tab)[0]
    return undefined
}
