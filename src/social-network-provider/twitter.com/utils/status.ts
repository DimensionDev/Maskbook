import { bioCard, postPopupInjectPointSelector, postsContentSelectors } from './selector'
import { isNil } from 'lodash-es'
import { timeout } from '../../../utils/utils'
import { MutationObserverWatcher } from '@holoflows/kit'

export const hasPostPopup = () => {
    return !!isNil(postPopupInjectPointSelector().evaluate())
}

/**
 * This can be help to make sure if bioCard exists on the page.
 * @throws exception if not exist
 * @return bioCard element, if exists
 */
export const fetchBioCard = () => timeout(new MutationObserverWatcher(bioCard()), 10000)

/**
 * Test if able to fetch posts.
 */
export const fetchPost = async () => {
    const s = (() => {
        if (hasPostPopup()) {
            return postPopupInjectPointSelector().concat(postsContentSelectors().enableSingleMode())
        }
        return postsContentSelectors().enableSingleMode()
    })()
    return timeout(new MutationObserverWatcher(s), 10000)
}
