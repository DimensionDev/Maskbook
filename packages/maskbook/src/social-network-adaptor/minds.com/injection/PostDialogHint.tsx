import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { useCallback } from 'react'
import { PostDialogHint } from '../../../components/InjectedComponents/PostDialogHint'
import { MaskMessage } from '../../../utils/messages'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { startWatch } from '../../../utils/watcher'
import { postEditorInPopupSelector, postEditorInTimelineSelector } from '../utils/selector'

export function injectPostDialogHintAtMinds(signal: AbortSignal) {
    renderPostDialogHintTo(postEditorInPopupSelector(), signal, 'popup')
    renderPostDialogHintTo(postEditorInTimelineSelector(), signal, 'timeline')
}

function renderPostDialogHintTo<T>(ls: LiveSelector<T, true>, signal: AbortSignal, reason: 'popup' | 'timeline') {
    const watcher = new MutationObserverWatcher(ls, document.querySelector('m-page')!)
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
        ...(reason === 'timeline' ? { width: '40px', transform: 'translateX(160px) translateY(-70px)' } : {}),
    },
}))

function PostDialogHintAtMinds({ reason }: { reason: 'timeline' | 'popup' }) {
    const { classes } = useStyles({ reason })

    const onHintButtonClicked = useCallback(
        () => MaskMessage.events.requestComposition.sendToLocal({ reason, open: true }),
        [reason],
    )
    return (
        <PostDialogHint
            onHintButtonClicked={onHintButtonClicked}
            classes={{
                buttonTransform: classes.buttonTransform,
            }}
            NotSetupYetPromptProps={{
                classes: {
                    button: classes.buttonText,
                },
            }}
        />
    )
}
