import { twitterUrl } from '../utils/url'
import { MutationObserverWatcher } from '@holoflows/kit/es'
import { postPopupInjectPointSelector } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { MessageCenter } from '../../../utils/messages'

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

    watcher.addListener('onAdd', () => MessageCenter.emit('startCompose', undefined, true))
    watcher.addListener('onRemove', () => MessageCenter.emit('cancelCompose', undefined, true))
    renderInShadowRoot(<PostDialogSpyAtTwitter />, watcher.firstDOMProxy.afterShadow)
}

function PostDialogSpyAtTwitter() {
    return <div style={{ display: 'none' }}></div>
}
