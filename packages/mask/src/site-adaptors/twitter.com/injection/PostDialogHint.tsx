import { MutationObserverWatcher, type LiveSelector } from '@dimensiondev/holoflows-kit'
import { CrossIsolationMessages, sayHelloShowed } from '@masknet/shared-base'
import { makeStyles, MaskColorVar } from '@masknet/theme'
import { makeTypedMessageText } from '@masknet/typed-message'
import { alpha } from '@mui/material'
import { clamp } from 'lodash-es'
import { useCallback } from 'react'
import { PostDialogHint } from '../../../components/InjectedComponents/PostDialogHint.js'
import { useI18N } from '../../../utils/index.js'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { startWatch, type WatchOptions } from '../../../utils/startWatch.js'
import { twitterBase } from '../base.js'
import { hasEditor, isCompose } from '../utils/postBox.js'
import { isReplyPageSelector, postEditorInPopupSelector, searchReplyToolbarSelector } from '../utils/selector.js'

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

    renderPostDialogHintTo('timeline', searchReplyToolbarSelector(), {
        signal,
        missingReportRule: { name: 'PostDialog hint timeline', rule: 'https://twitter.com/home' },
    })

    renderPostDialogHintTo(
        'popup',
        postEditorInPopupSelector().map((x) => (isCompose() && hasEditor() ? x : emptyNode)),
        {
            signal,
            missingReportRule: {
                name: 'PostDialog hint popup',
                rule: 'https://twitter.com/compose/tweet',
            },
        },
    )
}

function renderPostDialogHintTo<T extends HTMLElement>(
    reason: 'timeline' | 'popup',
    ls: LiveSelector<T, true>,
    options: WatchOptions,
) {
    const watcher = new MutationObserverWatcher(ls)
    startWatch(watcher, options)

    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, {
        signal: options.signal,
        tag: () => {
            // Vertical center the button when font size of Twitter is set to `large` or `very large`
            const tag = document.createElement('span')
            Object.assign(tag.style, {
                display: 'inline-flex',
                alignItems: 'center',
                height: '100%',
            })
            const svgIcon = document.querySelector('[data-testid="geoButton"] svg')
            const size = svgIcon ? clamp(svgIcon.getBoundingClientRect().width, 18, 24) : undefined
            const geoButton = document.querySelector('[data-testid="geoButton"]')
            const padding = geoButton && size ? (geoButton.getBoundingClientRect().width - size) / 2 : undefined
            if (padding) tag.style.setProperty('--icon-padding', `${padding}px`)
            if (size) tag.style.setProperty('--icon-size', `${size}px`)

            return tag
        },
    }).render(<PostDialogHintAtTwitter reason={reason} />)
}

function PostDialogHintAtTwitter({ reason }: { reason: 'timeline' | 'popup' }) {
    const { classes } = useStyles()
    const { t } = useI18N()

    const onHintButtonClicked = useCallback(() => {
        const content = sayHelloShowed[twitterBase.networkIdentifier].value
            ? undefined
            : makeTypedMessageText(
                  t('setup_guide_say_hello_content') +
                      t('setup_guide_say_hello_follow', { account: '@realMaskNetwork' }),
              )

        CrossIsolationMessages.events.compositionDialogEvent.sendToLocal({
            reason: isReplyPageSelector() ? 'reply' : reason,
            open: true,
            content,
        })
        sayHelloShowed[twitterBase.networkIdentifier].value = true
    }, [reason, isReplyPageSelector])

    return (
        <PostDialogHint
            disableGuideTip={reason === 'popup'}
            classes={{ iconButton: classes.iconButton, tooltip: classes.tooltip }}
            size={20}
            onHintButtonClicked={onHintButtonClicked}
            tooltip={{ disabled: false, placement: 'top' }}
        />
    )
}
