import { useCallback } from 'react'
import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { Composition } from '../../../components/CompositionDialog/Composition'
import { isMobileFacebook } from '../utils/isMobile'
import { PostDialogHint } from '../../../components/InjectedComponents/PostDialogHint'
import { startWatch } from '../../../utils/watcher'
import { taskOpenComposeBoxFacebook } from '../automation/openComposeBox'
import { makeStyles } from '@masknet/theme'

let composeBox: LiveSelector<Element>

const useStyles = makeStyles()(() => ({
    tooltip: {
        borderRadius: 8,
        padding: 8,
        marginBottom: '0 !important',
        fontSize: 12,
        background: 'rgba(0,0,0,.75)',
        boxShadow: '0 4px 10px 0 rgba(0,0,0,.5)',
        color: '#ddd',
    },
}))

function isGroup() {
    const matched = location.href.match(/\/groups/)
    if (!matched) return false
    return matched[0]
}

if (isMobileFacebook) {
    composeBox = new LiveSelector().querySelector('#structured_composer_form')
} else {
    if (isGroup()) {
        composeBox = new LiveSelector()
            .querySelector('[id="toolbarLabel"]')
            .closest(1)
            .querySelector('div:nth-child(2) > div:nth-child(4)')
    } else {
        composeBox = new LiveSelector()
            .querySelectorAll(
                '[role="dialog"] form > div:first-child > div:first-child > div:first-child > div:first-child > div:first-child > div:last-child > div:first-child  > div:last-child > div > div',
            )
            .at(-2)
    }
}

export function injectCompositionFacebook(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(composeBox.clone())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<UI />)

    signal.addEventListener(
        'abort',
        CrossIsolationMessages.events.requestComposition.on((data) => {
            if (data.reason === 'popup') return
            if (data.open === false) return
            taskOpenComposeBoxFacebook(data.content || '', data.options)
        }),
    )
}
function UI() {
    const { classes } = useStyles()
    const onHintButtonClicked = useCallback(
        () => CrossIsolationMessages.events.requestComposition.sendToLocal({ reason: 'popup', open: true }),
        [],
    )
    return (
        <span style={{ display: 'block', padding: 0, marginTop: 0 }}>
            <PostDialogHint
                size={24}
                classes={{ tooltip: classes.tooltip }}
                onHintButtonClicked={onHintButtonClicked}
                tooltip={{ disabled: false, placement: 'top' }}
            />
            <Composition type="popup" />
        </span>
    )
}
