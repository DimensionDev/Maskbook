import { MutationObserverWatcher, type LiveSelector } from '@dimensiondev/holoflows-kit'
import { postEditorInTimelineSelector, postEditorInPopupSelector } from '../utils/selector.js'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { hasEditor, isCompose } from '../utils/postBox.js'
import { Banner } from '../../../components/Welcomes/Banner.js'
import { startWatch, type WatchOptions } from '../../../utils/watcher.js'

export function injectBannerAtTwitter(signal: AbortSignal) {
    const emptyNode = document.createElement('div')
    injectBanner(postEditorInTimelineSelector(), {
        signal,
        missingReportRule: { name: 'Setup prompt', rule: 'https://twitter.com/home' },
    })
    injectBanner(
        postEditorInPopupSelector().map((x) => (isCompose() && hasEditor() ? x : emptyNode)),
        { signal, missingReportRule: { name: 'Setup prompt', rule: 'https://twitter.com/compose/tweet' } },
    )
}

function injectBanner<T>(ls: LiveSelector<T, true>, options: WatchOptions) {
    const watcher = new MutationObserverWatcher(ls)
    startWatch(watcher, options)

    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal: options.signal }).render(<Banner />)
}
