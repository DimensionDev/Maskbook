import { twitterUrl } from '../utils/url'
import { MutationObserverWatcher } from '@holoflows/kit/es'
import { postPopupInjectPointSelector } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { PostDialogSpy } from '../../../components/InjectedComponents/PostDialogSpy'

export function injectPostDialogSpyAtTwitter() {
    if (location.hostname.indexOf(twitterUrl.hostIdentifier) === -1) return
    const watcher = new MutationObserverWatcher(postPopupInjectPointSelector())
        .setDOMProxyOption({
            afterShadowRootInit: { mode: 'closed' },
        })
        .startWatch({
            childList: true,
            subtree: true,
        })

    renderInShadowRoot(<PostDialogSpyAtTwitter />, watcher.firstDOMProxy.afterShadow)
}

function PostDialogSpyAtTwitter() {
    return <PostDialogSpy />
}
