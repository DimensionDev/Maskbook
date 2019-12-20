import * as React from 'react'
import { twitterUrl } from '../utils/url'
import { MutationObserverWatcher, LiveSelector } from '@holoflows/kit/es'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { PostDialog } from '../../../components/InjectedComponents/PostDialog'
import { useTwitterButton, useTwitterCloseButton, useTwitterDialog } from '../utils/theme'
import { makeStyles } from '@material-ui/styles'
import { postEditorInPopupSelector, rootSelector } from '../utils/selector'
import { Theme } from '@material-ui/core'

const useStyles = makeStyles((theme: Theme) => ({
    MUIInputInput: {
        border: 'none',
        borderRadius: 5,
        padding: '12px 8px',
    },
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

    renderInShadowRoot(<PostDialogAtTwitter reason={reason} />, watcher.firstDOMProxy.afterShadow)
}

function PostDialogAtTwitter(props: { reason: 'timeline' | 'popup' }) {
    return (
        <PostDialog
            classes={{
                ...useStyles(),
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
            {...props}
        />
    )
}
