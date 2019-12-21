import * as React from 'react'
import { twitterUrl } from '../utils/url'
import { MutationObserverWatcher, LiveSelector } from '@holoflows/kit/es'
import { postEditorInPopupSelector } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { MessageCenter } from '../../../utils/messages'
import { hasEditor, isCompose } from '../utils/postBox'
import { sleep } from '../../../utils/utils'

export function injectPostDialogSpyAtTwitter() {
    if (location.hostname.indexOf(twitterUrl.hostIdentifier) === -1) return
    injectPostDialogPopupSpy(postEditorInPopupSelector())
}

function injectPostDialogTimelineSpy<T>(ls: LiveSelector<T, true>) {}

function injectPostDialogPopupSpy<T>(ls: LiveSelector<T, true>) {
    const watcher = new MutationObserverWatcher(ls)
        .setDOMProxyOption({
            afterShadowRootInit: { mode: 'closed' },
        })
        .startWatch({
            childList: true,
            subtree: true,
        })

    watcher.addListener('onAdd', async () => {
        await sleep(500)
        if (isCompose() && hasEditor()) {
            MessageCenter.emit('compositionUpdated', { reason: 'popup', open: true }, true)
        }
    })
    watcher.addListener('onRemove', () =>
        MessageCenter.emit('compositionUpdated', { reason: 'popup', open: false }, true),
    )
    renderInShadowRoot(<PostDialogSpyAtTwitter />, watcher.firstDOMProxy.afterShadow)
}

function PostDialogSpyAtTwitter() {
    return <div style={{ display: 'none' }}></div>
}
