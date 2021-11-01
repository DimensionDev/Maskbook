import { LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { makeStyles } from '@masknet/theme'
import { NotSetupYetPrompt } from '../../../components/shared/NotSetupYetPrompt'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { startWatch } from '../../../utils/watcher'
import { postEditorInPopupSelector, postEditorInTimelineSelector } from '../utils/selector'

export function injectSetupPromptAtMinds(signal: AbortSignal) {
    injectSetupPrompt(postEditorInPopupSelector(), signal)
    injectSetupPrompt(postEditorInTimelineSelector(), signal)
}

function injectSetupPrompt<T>(ls: LiveSelector<T, true>, signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(ls, document.querySelector('m-app')!)
    startWatch(watcher, signal)

    watcher.useForeach((node, key, meta) => {
        const tagsAnchor =
            watcher.firstDOMProxy.current?.parentElement?.querySelector<HTMLAnchorElement>('a:nth-child(4)')
        if (tagsAnchor) {
            tagsAnchor.style.marginRight = '10px'
        }
        createReactRootShadowed(watcher.firstDOMProxy.afterShadow, {
            signal,
        }).render(<MindsNotSetupYet />)
    })
}

const useStyles = makeStyles()({
    buttonText: {
        margin: 0,
    },
    content: {
        marginRight: 5,
    },
})

const MindsNotSetupYet = () => {
    const { classes } = useStyles()
    return (
        <NotSetupYetPrompt
            classes={{
                button: classes.buttonText,
                content: classes.content,
            }}
        />
    )
}
