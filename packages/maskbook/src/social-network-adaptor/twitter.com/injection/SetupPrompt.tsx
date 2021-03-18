import { MutationObserverWatcher, LiveSelector } from '@dimensiondev/holoflows-kit'
import { postEditorInTimelineSelector, postEditorInPopupSelector } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/shadow-root/renderInShadowRoot'
import { hasEditor, isCompose } from '../utils/postBox'
import { NotSetupYetPrompt } from '../../../components/shared/NotSetupYetPrompt'
import { startWatch } from '../../../utils/watcher'

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

    renderInShadowRoot(<NotSetupYetPrompt />, { shadow: () => watcher.firstDOMProxy.afterShadow, signal })
}
