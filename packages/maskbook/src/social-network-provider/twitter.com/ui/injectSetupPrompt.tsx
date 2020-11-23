import { twitterUrl } from '../utils/url'
import { MutationObserverWatcher, LiveSelector } from '@dimensiondev/holoflows-kit'
import { postEditorInTimelineSelector, postEditorInPopupSelector } from '../utils/selector'
import { renderInShadowRoot } from '../../../utils/shadow-root/renderInShadowRoot'
import { hasEditor, isCompose } from '../utils/postBox'
import { Flags } from '../../../utils/flags'
import { NotSetupYetPrompt } from '../../../components/shared/NotSetupYetPrompt'

export function injectSetupPromptAtTwitter() {
    if (location.hostname.indexOf(twitterUrl.hostIdentifier) === -1) return
    const emptyNode = document.createElement('div')
    injectSetupPrompt(postEditorInTimelineSelector())
    injectSetupPrompt(postEditorInPopupSelector().map((x) => (isCompose() && hasEditor() ? x : emptyNode)))
}

function injectSetupPrompt<T>(ls: LiveSelector<T, true>) {
    const watcher = new MutationObserverWatcher(ls)
        .setDOMProxyOption({
            afterShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode },
        })
        .startWatch({
            childList: true,
            subtree: true,
        })

    renderInShadowRoot(<NotSetupYetPrompt />, { shadow: () => watcher.firstDOMProxy.afterShadow })
}
