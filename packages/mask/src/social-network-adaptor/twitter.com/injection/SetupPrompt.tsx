import { MutationObserverWatcher, LiveSelector } from '@dimensiondev/holoflows-kit'
import { postEditorInTimelineSelector, postEditorInPopupSelector } from '../utils/selector.js'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { hasEditor, isCompose } from '../utils/postBox.js'
import { NotSetupYetPrompt } from '../../../components/shared/NotSetupYetPrompt.js'
import { startWatch } from '../../../utils/watcher.js'

export function injectSetupPromptAtTwitter(signal: AbortSignal) {
    const emptyNode = document.createElement('div')
    injectSetupPrompt(postEditorInTimelineSelector(), signal)
    injectSetupPrompt(
        postEditorInPopupSelector().map((x) => (isCompose() && hasEditor() ? x : emptyNode)),
        signal,
    )
}

function injectSetupPrompt<T>(ls: LiveSelector<T, true>, signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(ls)
    startWatch(watcher, signal)

    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(<NotSetupYetPrompt />)
}
