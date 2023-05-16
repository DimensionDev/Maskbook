import { type LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { Banner } from '../../../components/Welcomes/Banner.js'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { startWatch } from '../../../utils/watcher.js'
import { postEditorInTimelineSelector, postEditorInDialogSelector } from '../utils/selector.js'

export function injectBannerAtMinds(signal: AbortSignal) {
    injectBanner(postEditorInTimelineSelector(), signal, <MindsBannerTimeline />)
    injectBanner(postEditorInDialogSelector(), signal, <MindsBannerPopup />)
}

function injectBanner<T>(ls: LiveSelector<T, true>, signal: AbortSignal, element: JSX.Element) {
    const watcher = new MutationObserverWatcher(ls)
    startWatch(watcher, signal)

    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, {
        signal,
    }).render(element)
}

const useStyles = makeStyles()({
    buttonText: {
        margin: '-2px 0 !important',
        transform: 'translateX(200px) translateY(-78px)',
    },
    content: {
        marginRight: 5,
    },
    buttonNoMargin: {
        margin: '0 !important',
    },
})

const MindsBannerTimeline = () => {
    const { classes } = useStyles()
    return (
        <Banner
            iconType="minds"
            classes={{
                buttonText: classes.buttonText,
                content: classes.content,
            }}
        />
    )
}

const MindsBannerPopup = () => {
    const { classes } = useStyles()
    return <Banner iconType="minds" classes={{ buttonText: classes.buttonNoMargin }} />
}
