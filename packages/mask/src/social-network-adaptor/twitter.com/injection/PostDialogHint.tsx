import { useCallback, useEffect, useState } from 'react'
import { MutationObserverWatcher, LiveSelector } from '@dimensiondev/holoflows-kit'
import { isReply, postEditorInPopupSelector, searchReplyToolbarSelector } from '../utils/selector'
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
import { pasteTextToCompositionTwitter } from '../automation/pasteTextToComposition'

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
    const [reply, setReply] = useState(false)

    const onHintButtonClicked = useCallback(() => {
        const content = sayHelloShowed[twitterBase.networkIdentifier].value
            ? undefined
            : makeTypedMessageText(
                  t('setup_guide_say_hello_content') +
                      t('setup_guide_say_hello_follow', { account: '@realMaskNetwork' }),
              )

        MaskMessages.events.requestComposition.sendToLocal({ reason, open: true, content, reply })
        sayHelloShowed[twitterBase.networkIdentifier].value = true
    }, [reason, reply])

    useEffect(() => {
        setReply(isReply())
    }, [location])

    useEffect(() => {
        return MaskMessages.events.message.on(async (data) => {
            pasteTextToCompositionTwitter?.(data.text, { recover: true, reply: true })
        })
    }, [])
    return (
        <PostDialogHint
            classes={{ iconButton: classes.iconButton, tooltip: classes.tooltip }}
            size={20}
            onHintButtonClicked={onHintButtonClicked}
            tooltip={{ disabled: false }}
        />
    )
}
