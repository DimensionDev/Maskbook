import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { NotSetupYetPrompt } from '../../../components/shared/NotSetupYetPrompt'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { startWatch } from '../../../utils/watcher'
import { postEditorInTimelineSelector, postEditorInDialogSelector } from '../utils/selector'

export function injectSetupPromptAtMinds(signal: AbortSignal) {
    injectSetupPrompt(postEditorInTimelineSelector(), signal, <MindsNotSetupYet_Timeline />)
    injectSetupPrompt(postEditorInDialogSelector(), signal, <MindsNotSetupYet_Popup />)
}

function injectSetupPrompt<T>(ls: LiveSelector<T, true>, signal: AbortSignal, element: JSX.Element) {
    const watcher = new MutationObserverWatcher(ls)
    startWatch(watcher, signal)

    watcher.useForeach((node, key, meta) => {
        createReactRootShadowed(watcher.firstDOMProxy.afterShadow, {
            signal,
        }).render(element)
    })
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

const MindsNotSetupYet_Timeline = () => {
    const { classes } = useStyles()
    return (
        <NotSetupYetPrompt
            iconType="minds"
            classes={{
                buttonText: classes.buttonText,
                content: classes.content,
            }}
        />
    )
}

const MindsNotSetupYet_Popup = () => {
    const { classes } = useStyles()
    return <NotSetupYetPrompt iconType="minds" classes={{ buttonText: classes.buttonNoMargin }} />
}
