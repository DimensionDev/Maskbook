import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@material-ui/core'
import { useCallback } from 'react'
import { PostDialogHint } from '../../../components/InjectedComponents/PostDialogHint'
import { MaskMessage } from '../../../utils/messages'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { startWatch } from '../../../utils/watcher'
import { postEditorInPopupSelector, postEditorInTimelineSelector } from '../utils/selector'

export function injectPostDialogHintAtMinds(signal: AbortSignal) {
    renderPostDialogHintTo(postEditorInPopupSelector(), signal)
    renderPostDialogHintTo(postEditorInTimelineSelector(), signal)
}

function renderPostDialogHintTo<T>(ls: LiveSelector<T, true>, signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(ls, document.querySelector('m-page')!)
    startWatch(watcher, signal)

    watcher.useForeach((node, key, meta) => {
        createReactRootShadowed(watcher.firstDOMProxy.afterShadow, {
            signal,
        }).render(<PostDialogHintAtMinds reason="popup" />)
    })
}

const useStyles = makeStyles(() => ({
    buttonText: {
        margin: 0,
    },
}))

function PostDialogHintAtMinds({ reason }: { reason: 'timeline' | 'popup' }) {
    const classes = useStyles()

    const onHintButtonClicked = useCallback(
        () => MaskMessage.events.compositionUpdated.sendToLocal({ reason, open: true }),
        [reason],
    )
    return (
        <PostDialogHint
            onHintButtonClicked={onHintButtonClicked}
            NotSetupYetPromptProps={{
                classes: {
                    button: classes.buttonText,
                },
            }}
        />
    )
}
