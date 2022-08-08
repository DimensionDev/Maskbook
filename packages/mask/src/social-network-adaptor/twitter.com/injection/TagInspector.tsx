import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { TagType } from '@masknet/plugin-infra'
import { TagInspector } from '../../../components/InjectedComponents/TagInspector'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { startWatch } from '../../../utils/watcher'
import { searchTagSelector } from '../utils/selector'

export function injectTagInspectorAtTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchTagSelector())
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(
        <TagInspector type={TagType.CASH} name="USDT" />,
    )
}
