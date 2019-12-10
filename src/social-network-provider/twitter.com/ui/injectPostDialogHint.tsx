import * as React from 'react'
import { useCallback } from 'react'
import { twitterUrl } from '../utils/url'
import { MutationObserverWatcher } from '@holoflows/kit/es'
import { postEditorInTimelineSelector } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { PostDialogHint } from '../../../components/InjectedComponents/PostDialogHint'
import { makeStyles, Theme } from '@material-ui/core'
import { MessageCenter } from '../../../utils/messages'
import { useTwitterButton } from '../utils/theme'
import { hasDraftEditor } from '../utils/postBox'

export function injectPostDialogHintAtTwitter() {
    if (location.hostname.indexOf(twitterUrl.hostIdentifier) === -1) return
    const watcher = new MutationObserverWatcher(
        postEditorInTimelineSelector().map(x => (hasDraftEditor(x) ? x : document.createElement('div'))),
    )
        .setDOMProxyOption({
            afterShadowRootInit: { mode: 'closed' },
        })
        .startWatch({
            childList: true,
            subtree: true,
        })

    renderInShadowRoot(<PostDialogHintAtTwitter />, watcher.firstDOMProxy.afterShadow)
}

const useStyles = makeStyles((theme: Theme) => {
    const { type, grey } = theme.palette
    return {
        root: {
            borderTopLeftRadius: 0,
            borderTopRightRadius: 0,
        },
        content: {
            borderTop: `1px solid ${type === 'dark' ? grey[800] : grey[200]}`,
            padding: '16px 17px 16px 15px',
        },
        title: {
            fontSize: 15,
            fontWeight: 'bold',
        },
    }
})
function PostDialogHintAtTwitter() {
    const classes = {
        ...useStyles(),
        ...useTwitterButton(),
    }
    const onHintButtonClicked = useCallback(
        () => MessageCenter.emit('compositionUpdated', { reason: 'timeline', open: true }, true),
        [],
    )
    return <PostDialogHint classes={classes} onHintButtonClicked={onHintButtonClicked} />
}
