import { DOMProxy, LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { NFTBadgeTweet } from '../../../../plugins/Avatar/SNSAdaptor/NFTBadgeTweet'
import { createReactRootShadowed, startWatch } from '../../../../utils'
import { getInjectNodeInfo } from '../../utils/avatar'
import { searchRetweetAvatarSelector, searchTweetAvatarSelector } from '../../utils/selector'
import { NFTAvatarMiniClip } from '../../../../plugins/Avatar/SNSAdaptor/NFTAvatarClip'
import { RSS3_KEY_SNS } from '../../../../plugins/Avatar/constants'

function _(main: () => LiveSelector<HTMLElement, false>, signal: AbortSignal) {
    startWatch(
        new MutationObserverWatcher(main()).useForeach((ele, _, meta) => {
            let remover = () => {}
            const remove = () => remover()

            const run = async () => {
                const info = getInjectNodeInfo(ele.firstChild as HTMLElement)
                if (!info) return

                const proxy = DOMProxy({ afterShadowRootInit: { mode: 'closed' } })
                proxy.realCurrent = info.element.firstChild as HTMLElement
                const root = createReactRootShadowed(proxy.afterShadow, { signal })
                root.render(
                    <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}>
                        {info.isTwitterNFT ? (
                            <NFTAvatarMiniClip width={info.width} height={info.height} />
                        ) : (
                            <NFTBadgeTweet
                                width={info.width - 4}
                                height={info.height - 4}
                                avatarId={info.avatarId}
                                snsKey={RSS3_KEY_SNS.TWITTER}
                            />
                        )}
                    </div>,
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

export async function injectUserNFTAvatarAtTweet(signal: AbortSignal) {
    _(searchTweetAvatarSelector, signal)
    _(searchRetweetAvatarSelector, signal)
}
