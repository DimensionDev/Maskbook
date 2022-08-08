import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { TagType } from '@masknet/plugin-infra'
import { PostTagInspector } from '../../../components/InjectedComponents/PostTagInspector'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { startWatch } from '../../../utils/watcher'
import { searchPostTagSelector } from '../utils/selector'

export function injectPostTagInspectorAtTwitter(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(searchPostTagSelector())
        .addListener('onAdd', onUpdatePosition)
        .addListener('onChange', onUpdatePosition)
        .startWatch(
            {
                childList: true,
                subtree: true,
            },
            signal,
        )
    startWatch(watcher, signal)
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(
        <PostTagInspector type={TagType.CASH} name="USDT" />,
    )

    function onUpdatePosition() {}
}
