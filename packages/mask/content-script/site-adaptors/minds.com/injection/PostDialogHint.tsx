import { useCallback } from 'react'
import { type LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { PostDialogHint } from '../../../components/InjectedComponents/PostDialogHint.js'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { startWatch } from '../../../utils/startWatch.js'
import { postEditorInDialogSelector, postEditorInTimelineSelector } from '../utils/selector.js'
import { isMinds } from '../base.js'
import { activatedSiteAdaptorUI } from '../../../site-adaptor-infra/ui.js'
import type { CompositionType } from '@masknet/plugin-infra/content-script'

export function injectPostDialogHintAtMinds(signal: AbortSignal) {
    renderPostDialogHintTo(postEditorInDialogSelector(), signal, 'popup')
    renderPostDialogHintTo(postEditorInTimelineSelector(), signal, 'timeline')
}

function renderPostDialogHintTo<T>(ls: LiveSelector<T, true>, signal: AbortSignal, reason: CompositionType) {
    const watcher = new MutationObserverWatcher(ls)
    startWatch(watcher, signal)

    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, {
        signal,
    }).render(<PostDialogHintAtMinds reason={reason} />)
}

interface StyleProps {
    reason: string
}

const useStyles = makeStyles<StyleProps>()((theme, { reason }) => ({
    buttonTransform: {
        ...(reason === 'timeline' ?
            {
                width: '40px',
                transform: !isMinds(activatedSiteAdaptorUI!) ? 'translateX(200px) translateY(-78px)' : '',
            }
        :   {}),
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
            disableGuideTip
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
