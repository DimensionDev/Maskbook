import { twitterUrl } from '../utils/url'
import { MutationObserverWatcher } from '@holoflows/kit/es'
import { postPopupInjectPointSelector } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { PostModalHint } from '../../../components/InjectedComponents/PostModalHint'

export function injectPostModalAtTwitter() {
    if (location.hostname.indexOf(twitterUrl.hostIdentifier) === -1) return
    const watcher = new MutationObserverWatcher(postPopupInjectPointSelector())
        .setDOMProxyOption({
            afterShadowRootInit: { mode: 'closed' },
        })
        .startWatch({
            childList: true,
            subtree: true,
        })

    renderInShadowRoot(<PostModalHintAtTwitter />, watcher.firstDOMProxy.afterShadow)
}

function PostModalHintAtTwitter() {
    return <PostModalHint />
}
