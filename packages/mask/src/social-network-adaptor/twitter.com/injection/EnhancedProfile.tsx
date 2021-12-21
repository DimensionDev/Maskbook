import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { EnhancedProfilePage } from '../../../plugins/Profile/SNSAdaptor/EnhancedProfile'
import { createReactRootShadowed, startWatch } from '../../../utils'
import {
    searchNewTweetButtonSelector,
    searchProfileEmptySelector,
    searchProfileTabPageSelector,
} from '../utils/selector'

function injectEnhancedProfilePageForEmptyState(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileEmptySelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<EnhancedProfilePageAtTwitter />)
}

function injectEnhancedProfilePageState(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchProfileTabPageSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<EnhancedProfilePageAtTwitter />)
}

export function injectEnhancedProfileAtTwitter(signal: AbortSignal) {
    injectEnhancedProfilePageForEmptyState(signal)
    injectEnhancedProfilePageState(signal)
}

function getStyleProps() {
    const newTweetButton = searchNewTweetButtonSelector().evaluate()
    return {
        backgroundColor: newTweetButton ? window.getComputedStyle(newTweetButton).backgroundColor : undefined,
        fontFamily: newTweetButton?.firstChild
            ? window.getComputedStyle(newTweetButton.firstChild as HTMLElement).fontFamily
            : undefined,
    }
}

export function EnhancedProfilePageAtTwitter() {
    return <EnhancedProfilePage  />
}
