import * as React from 'react'
import { useCallback } from 'react'
import { twitterUrl } from '../utils/url'
import { MutationObserverWatcher, LiveSelector } from '@holoflows/kit/es'
import { postEditorInTimelineSelector, postEditorInPopupSelector } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { PostDialogHint } from '../../../components/InjectedComponents/PostDialogHint'
import { makeStyles, Theme } from '@material-ui/core'
import { MessageCenter } from '../../../utils/messages'
import { useTwitterButton, useTwitterBanner } from '../utils/theme'
import { hasEditor, isCompose, isMobile } from '../utils/postBox'

export function injectPostDialogHintAtTwitter() {
    if (location.hostname.indexOf(twitterUrl.hostIdentifier) === -1) return
    const emptyNode = document.createElement('div')
    renderPostDialogHintTo(postEditorInTimelineSelector().map((x) => (hasEditor() ? x : emptyNode)))
    renderPostDialogHintTo(postEditorInPopupSelector().map((x) => (isCompose() && hasEditor() ? x : emptyNode)))
}

function renderPostDialogHintTo<T>(ls: LiveSelector<T, true>) {
    if (isMobile()) return
    const watcher = new MutationObserverWatcher(ls)
        .setDOMProxyOption({
            afterShadowRootInit: { mode: 'closed' },
        })
        .useForeach(() => {
            renderInShadowRoot(<PostDialogHintAtTwitter />, {
                shadow: () => watcher.firstDOMProxy.afterShadow,
                normal: () => watcher.firstDOMProxy.after,
            })
        })
        .startWatch({
            childList: true,
            subtree: true,
        })
}

export const useTwitterThemedPostDialogHint = makeStyles((theme: Theme) => ({
    root: {
        borderTopLeftRadius: 0,
        borderTopRightRadius: 0,
        [`@media (max-width: ${theme.breakpoints.width('sm')}px)`]: {
            borderRadius: '0 !important',
        },
    },
    content: {
        borderTop: `1px solid ${theme.palette.type === 'dark' ? '#2f3336' : '#e6ecf0'}`,
        padding: '16px 17px 16px 15px',
        [`@media (max-width: ${theme.breakpoints.width('sm')}px)`]: {
            '&': {
                maxWidth: 600,
                margin: '0 auto',
                borderTop: 'none',
                lineHeight: 21,
                padding: '10px 14px !important',
            },
        },
    },
}))

function PostDialogHintAtTwitter() {
    const classes = {
        ...useTwitterThemedPostDialogHint(),
        ...useTwitterButton(),
    }
    const onHintButtonClicked = useCallback(
        () => MessageCenter.emit('compositionUpdated', { reason: 'timeline', open: true }),
        [],
    )
    return (
        <PostDialogHint
            classes={classes}
            NotSetupYetPromptProps={{
                classes: {
                    ...useTwitterBanner(),
                    ...useTwitterButton(),
                },
            }}
            onHintButtonClicked={onHintButtonClicked}
        />
    )
}
