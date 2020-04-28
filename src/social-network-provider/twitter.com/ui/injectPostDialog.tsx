import * as React from 'react'
import { twitterUrl } from '../utils/url'
import { MutationObserverWatcher, LiveSelector, ValueRef } from '@holoflows/kit/es'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { PostDialog } from '../../../components/InjectedComponents/PostDialog'
import { useTwitterButton, useTwitterCloseButton, useTwitterLabel, useTwitterDialog } from '../utils/theme'
import { makeStyles } from '@material-ui/styles'
import { postEditorInPopupSelector, rootSelector } from '../utils/selector'
import type { Theme } from '@material-ui/core'

const useStyles = makeStyles((theme: Theme) => ({
    input: {
        '&::placeholder': {
            color: '#9197a3',
            opacity: 1,
        },
        '&:focus::placeholder': {
            color: '#bdc1c9',
        },
        [`@media (max-width: ${theme.breakpoints.width('sm')}px)`]: {
            '&::placeholder': {
                color: '#657786 !important',
            },
        },
    },
}))

export function injectPostDialogAtTwitter() {
    if (location.hostname.indexOf(twitterUrl.hostIdentifier) === -1) return
    renderPostDialogTo('popup', postEditorInPopupSelector())
    renderPostDialogTo('timeline', rootSelector())
}

function renderPostDialogTo<T>(reason: 'timeline' | 'popup', ls: LiveSelector<T, true>) {
    const watcher = new MutationObserverWatcher(ls)
        .setDOMProxyOption({
            afterShadowRootInit: { mode: 'closed' },
        })
        .startWatch({
            childList: true,
            subtree: true,
        })

    renderInShadowRoot(<PostDialogAtTwitter reason={reason} />, {
        shadow: () => watcher.firstDOMProxy.afterShadow,
        normal: () => watcher.firstDOMProxy.after,
    })
}

function PostDialogAtTwitter(props: { reason: 'timeline' | 'popup' }) {
    return (
        <PostDialog
            classes={{
                ...useStyles(),
                ...useTwitterLabel(),
                ...useTwitterDialog(),
                ...useTwitterButton(),
                ...useTwitterCloseButton(),
            }}
            SelectRecipientsUIProps={{
                SelectRecipientsDialogUIProps: {
                    classes: {
                        ...useTwitterDialog(),
                        ...useTwitterButton(),
                        ...useTwitterCloseButton(),
                    },
                },
            }}
            reason={props.reason}
        />
    )
}
