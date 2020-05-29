import * as React from 'react'
import { twitterUrl } from '../utils/url'
import { MutationObserverWatcher, LiveSelector, ValueRef } from '@holoflows/kit/es'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { PostDialog } from '../../../components/InjectedComponents/PostDialog'
import { useTwitterButton, useTwitterCloseButton, useTwitterLabel, useTwitterDialog } from '../utils/theme'
import { makeStyles } from '@material-ui/styles'
import type { Theme } from '@material-ui/core'
import { postEditorContentInPopupSelector, rootSelector } from '../utils/selector'

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
    renderPostDialogTo('popup', postEditorContentInPopupSelector())
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
    const rootRef = React.useRef<HTMLDivElement>(null)
    const dialogProps =
        props.reason === 'popup'
            ? {
                  disablePortal: true,
                  container: () => rootRef.current,
              }
            : {}
    const dialog = (
        <PostDialog
            classes={{
                ...useStyles(),
                ...useTwitterLabel(),
                ...useTwitterDialog(),
                ...useTwitterButton(),
                ...useTwitterCloseButton(),
            }}
            DialogProps={dialogProps}
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

    // ! Render dialog into native composition view instead of portal shadow
    // ! More https://github.com/DimensionDev/Maskbook/issues/837
    return props.reason === 'popup' ? <div ref={rootRef}>{dialog}</div> : dialog
}
