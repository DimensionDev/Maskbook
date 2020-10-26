import * as React from 'react'
import { twitterUrl } from '../utils/url'
import { MutationObserverWatcher, LiveSelector } from '@dimensiondev/holoflows-kit/es'
import { posteditorToolbarSeelctor } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/shadow-root/renderInShadowRoot'
import { PostDialogIcon } from '../../../components/InjectedComponents/PostDialogIcon'
import { MessageCenter } from '../../../utils/messages'
import { isCompose, isMobile } from '../utils/postBox'
import { Flags } from '../../../utils/flags'
import { makeStyles, Theme } from '@material-ui/core'

export function injectPostDialogIconAtTwitter() {
    if (location.hostname.indexOf(twitterUrl.hostIdentifier) === -1) return
    const emptyNode = document.createElement('div')
    renderPostDialogIconTo(posteditorToolbarSeelctor().map((x) => (isMobile() && isCompose() ? x : emptyNode)))
}

function renderPostDialogIconTo<T>(ls: LiveSelector<T, true>) {
    const watcher = new MutationObserverWatcher(ls)
        .setDOMProxyOption({
            afterShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode },
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

const useTwitterMaskbookIcon = makeStyles((theme: Theme) => ({
    root: {
        width: 38,
        height: 38,
        boxSizing: 'border-box',
        padding: theme.spacing(1),
    },
}))

function PostDialogIconAtTwitter() {
    const classes = useTwitterMaskbookIcon()
    const onIconClicked = () => MessageCenter.emit('compositionUpdated', { reason: 'timeline', open: true })
    return <PostDialogIcon classes={classes} onClick={onIconClicked} />
}
