import { bioCardSelector } from './selector'
import { timeout } from '../../../utils/utils'
import { MutationObserverWatcher } from '@holoflows/kit'

/**
 * This can be help to make sure if bioCard exists on the page.
 * @throws exception if not exist
 * @return bioCard element, if exists
 */
export const fetchBioCard = () => timeout(new MutationObserverWatcher(bioCardSelector()), 10000)
