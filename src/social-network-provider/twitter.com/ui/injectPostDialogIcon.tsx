import * as React from 'react'
import { useCallback } from 'react'
import { twitterUrl } from '../utils/url'
import { MutationObserverWatcher, LiveSelector } from '@holoflows/kit/es'
import { posteditorToolbarSeelctor } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { PostDialogIcon } from '../../../components/InjectedComponents/PostDialogIcon'
import { MessageCenter } from '../../../utils/messages'
import { isCompose, isMobile } from '../utils/postBox'
import { useTwitterMaskbookIcon } from '../utils/theme'

export function injectPostDialogIconAtTwitter() {
    if (location.hostname.indexOf(twitterUrl.hostIdentifier) === -1) return
    const emptyNode = document.createElement('div')
    renderPostDialogIconTo(posteditorToolbarSeelctor().map((x) => (isMobile() && isCompose() ? x : emptyNode)))
}

function renderPostDialogIconTo<T>(ls: LiveSelector<T, true>) {
    const watcher = new MutationObserverWatcher(ls)
        .setDOMProxyOption({
            afterShadowRootInit: { mode: 'closed' },
        })
        .startWatch({
            childList: true,
            subtree: true,
        })

    renderInShadowRoot(<PostDialogIconAtTwitter />, {
        shadow: () => watcher.firstDOMProxy.afterShadow,
        normal: () => watcher.firstDOMProxy.after,
    })
}

function PostDialogIconAtTwitter() {
    const classes = {
        ...useTwitterMaskbookIcon(),
    }
    const onIconClicked = useCallback(
        () => MessageCenter.emit('compositionUpdated', { reason: 'timeline', open: true }),
        [],
    )
    return <PostDialogIcon classes={classes} onClick={onIconClicked} />
}
