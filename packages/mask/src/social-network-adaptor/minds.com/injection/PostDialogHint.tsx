import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { useCallback } from 'react'
import { PostDialogHint } from '../../../components/InjectedComponents/PostDialogHint.js'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { startWatch } from '../../../utils/watcher.js'
import { postEditorInDialogSelector, postEditorInTimelineSelector } from '../utils/selector.js'

export function injectPostDialogHintAtMinds(signal: AbortSignal) {
    renderPostDialogHintTo(postEditorInDialogSelector(), signal, 'popup')
    renderPostDialogHintTo(postEditorInTimelineSelector(), signal, 'timeline')
}

function renderPostDialogHintTo<T>(ls: LiveSelector<T, true>, signal: AbortSignal, reason: 'popup' | 'timeline') {
    const watcher = new MutationObserverWatcher(ls, document.querySelector('m-app')!)
    startWatch(watcher, signal)

    watcher.useForeach((node, key, meta) => {
        createReactRootShadowed(watcher.firstDOMProxy.afterShadow, {
            signal,
        }).render(<PostDialogHintAtMinds reason={reason} />)
    })
}

interface StyleProps {
    reason: string
}

const useStyles = makeStyles<StyleProps>()((theme, { reason }) => ({
    buttonText: {
        margin: 0,
    },
    buttonTransform: {
        ...(reason === 'timeline' ? { width: '40px', transform: 'translateX(200px) translateY(-78px)' } : {}),
    },
    iconButton: {
        '&:hover': {
            background: 'none',
        },
    },
}))

function PostDialogHintAtMinds({ reason }: { reason: 'timeline' | 'popup' }) {
    const { classes } = useStyles({ reason })

    const onHintButtonClicked = useCallback(
        () => CrossIsolationMessages.events.compositionDialogEvent.sendToLocal({ reason, open: true }),
        [reason],
    )
    return (
        <PostDialogHint
            size={17}
            iconType="minds"
            onHintButtonClicked={onHintButtonClicked}
            tooltip={{ disabled: true }}
            classes={{
                buttonTransform: classes.buttonTransform,
                iconButton: classes.iconButton,
            }}
        />
    )
}
