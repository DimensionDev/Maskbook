import * as React from 'react'
import { twitterUrl } from '../utils/url'
import { MutationObserverWatcher, LiveSelector, ValueRef } from '@holoflows/kit/es'
import { renderInShadowRoot } from '../../../utils/jss/renderInShadowRoot'
import { PostDialog } from '../../../components/InjectedComponents/PostDialog'
import { useTwitterButton, useTwitterCloseButton, useTwitterLabel, useTwitterDialog } from '../utils/theme'
import { makeStyles } from '@material-ui/styles'
import { postEditorInPopupSelector, rootSelector } from '../utils/selector'
import { Theme } from '@material-ui/core'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { instanceOfTwitterUI } from '.'

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
    const meta = instanceOfTwitterUI.typedMessageMetadata
    renderPostDialogTo('popup', postEditorInPopupSelector(), meta)
    renderPostDialogTo('timeline', rootSelector(), meta)
}

function renderPostDialogTo<T>(
    reason: 'timeline' | 'popup',
    ls: LiveSelector<T, true>,
    typedMessageMetadata: ValueRef<ReadonlyMap<string, any>>,
) {
    const watcher = new MutationObserverWatcher(ls)
        .setDOMProxyOption({
            afterShadowRootInit: { mode: 'closed' },
        })
        .startWatch({
            childList: true,
            subtree: true,
        })

    renderInShadowRoot(
        <PostDialogAtTwitter typedMessageMetadata={typedMessageMetadata} reason={reason} />,
        watcher.firstDOMProxy.afterShadow,
    )
}

function PostDialogAtTwitter(props: {
    reason: 'timeline' | 'popup'
    typedMessageMetadata: ValueRef<ReadonlyMap<string, any>>
}) {
    const meta: ReadonlyMap<string, any> = useValueRef(props.typedMessageMetadata)
    return (
        <PostDialog
            typedMessageMetadata={meta}
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
        />
    )
}
