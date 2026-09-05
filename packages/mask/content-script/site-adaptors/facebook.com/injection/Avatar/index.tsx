import { noop } from 'lodash-es'
import { Flags } from '@masknet/flags'
import { DOMProxy, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { attachReactTreeWithContainer } from '../../../../utils/shadow-root/renderInShadowRoot.js'
import { startWatch } from '../../../../utils/startWatch.js'
import { inpageAvatarSelector } from '../../utils/selector.js'

export async function injectAvatar(signal: AbortSignal) {
    startWatch(
        new MutationObserverWatcher(inpageAvatarSelector()).useForeach((ele) => {
            let remover = noop
            const remove = () => remover()

            const run = async () => {
                // onNodeMutation/onTargetChanged re-run this for the same `ele` (lazy image src
                // swaps, hover states, feed virtualization reusing nodes). A fresh DOMProxy() here
                // attaches a brand-new shadow-root sibling every time, so the previous one must be
                // torn down first or it leaks a live React tree per mutation. Mirrors the fix on
                // twitter.com/injection/Avatar.
                remove()

                const proxy = DOMProxy({
                    afterShadowRootInit: Flags.shadowRootInit,
                })
                proxy.realCurrent = ele.firstChild as HTMLElement
                // create stacking context
                ele.style.position = 'relative'

                const root = attachReactTreeWithContainer(proxy.afterShadow, { untilVisible: true, signal })
                root.render(
                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: 2,
                        }}
                    />,
                )
                remover = root.destroy
            }

            run()
            return {
                onNodeMutation: run,
                onTargetChanged: run,
                onRemove: remove,
            }
        }),
        signal,
    )
}
