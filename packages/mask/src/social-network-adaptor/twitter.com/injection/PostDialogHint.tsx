import { useCallback, useEffect, useState } from 'react'
import { MutationObserverWatcher, LiveSelector } from '@dimensiondev/holoflows-kit'
import { isReplyPageSelector, postEditorInPopupSelector, searchReplyToolbarSelector } from '../utils/selector'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { PostDialogHint } from '../../../components/InjectedComponents/PostDialogHint'
import { MaskMessages } from '../../../utils/messages'
import { hasEditor, isCompose } from '../utils/postBox'
import { startWatch } from '../../../utils/watcher'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { alpha } from '@mui/material'
import { twitterBase } from '../base'
import { sayHelloShowed } from '../../../settings/settings'
import { makeTypedMessageText } from '@masknet/typed-message'
import { useI18N } from '../../../utils'

const useStyles = makeStyles()((theme) => ({
    iconButton: {
        '&:hover': {
            background: alpha(theme.palette.primary.main, 0.1),
        },
    },
    tooltip: {
        marginTop: '2px !important',
        borderRadius: 2,
        padding: 4,
        background: MaskColorVar.twitterTooltipBg,
        color: MaskColorVar.white,
    },
}))

export function injectPostDialogHintAtTwitter(signal: AbortSignal) {
    const emptyNode = document.createElement('div')
    renderPostDialogHintTo('timeline', searchReplyToolbarSelector(), signal)

    renderPostDialogHintTo(
        'popup',
        postEditorInPopupSelector().map((x) => (isCompose() && hasEditor() ? x : emptyNode)),
        signal,
    )
}

function renderPostDialogHintTo<T>(reason: 'timeline' | 'popup', ls: LiveSelector<T, true>, signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(ls)
    startWatch(watcher, signal)

    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(
        <PostDialogHintAtTwitter reason={reason} />,
    )
}

function PostDialogHintAtTwitter({ reason }: { reason: 'timeline' | 'popup' }) {
    const { classes } = useStyles()
    const { t } = useI18N()
    const [isReply, setIsReply] = useState(false)

    const onHintButtonClicked = useCallback(() => {
        const content = sayHelloShowed[twitterBase.networkIdentifier].value
            ? undefined
            : makeTypedMessageText(
                  t('setup_guide_say_hello_content') +
                      t('setup_guide_say_hello_follow', { account: '@realMaskNetwork' }),
              )

        MaskMessages.events.requestComposition.sendToLocal({
            reason: isReplyPageSelector() ? 'reply' : reason,
            open: true,
            content,
        })
        sayHelloShowed[twitterBase.networkIdentifier].value = true
    }, [reason, isReplyPageSelector])

    useEffect(() => {
        setIsReply(isReplyPageSelector())
    }, [location])

    return (
        <PostDialogHint
            disableGuideTip={reason === 'popup'}
            classes={{ iconButton: classes.iconButton, tooltip: classes.tooltip }}
            size={20}
            onHintButtonClicked={onHintButtonClicked}
            tooltip={{ disabled: false }}
        />
    )
}
