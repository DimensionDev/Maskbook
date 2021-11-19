import { DOMProxy, LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { NFTBadgeTweet } from '../../../../plugins/Avatar/SNSAdaptor/NFTBadgeTweet'
import { createReactRootShadowed, Flags, startWatch } from '../../../../utils'
import { getInjectNodeInfo } from '../../utils/avatar'
import { searchRetweetAvatarSelector, searchTweetAvatarSelector } from '../../utils/selector'

function _(main: () => LiveSelector<HTMLElement, false>, signal: AbortSignal) {
    startWatch(
        new MutationObserverWatcher(main()).useForeach((ele, _, meta) => {
            let remover = () => {}
            const remove = () => remover()

            const run = async () => {
                const info = getInjectNodeInfo(ele.firstChild as HTMLElement)
                if (!info) return

                const proxy = DOMProxy({ afterShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode } })
                proxy.realCurrent = info.element.firstChild as HTMLElement
                const root = createReactRootShadowed(proxy.afterShadow, { signal })
                root.render(
                    <div style={{ position: 'absolute', top: -2, left: -2, zIndex: -1 }}>
                        <NFTBadgeTweet width={info.width} height={info.height} avatarId={info.avatarId} />
                    </div>,
                )
                remover = root.destory
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

export async function injectUserNFTAvatarAtTweet(signal: AbortSignal) {
    _(searchTweetAvatarSelector, signal)
    _(searchRetweetAvatarSelector, signal)
}
