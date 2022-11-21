import { DOMProxy, LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { NFTBadgeTimeline } from '../../../../plugins/Avatar/SNSAdaptor/NFTBadgeTimeline.js'
import { createReactRootShadowed, startWatch } from '../../../../utils/index.js'
import { getInjectNodeInfo } from '../../utils/avatar.js'
import { postAvatarsContentSelector } from '../../utils/selector.js'
import { NFTAvatarMiniClip } from '../../../../plugins/Avatar/SNSAdaptor/NFTAvatarClip.js'
import { RSS3_KEY_SNS } from '../../../../plugins/Avatar/constants.js'

function getTwitterId(ele: HTMLElement) {
    const twitterIdNode = (ele.firstChild?.nextSibling as HTMLElement).querySelector(
        '[dir="ltr"] > span',
    ) as HTMLSpanElement
    if (!twitterIdNode) return
    return twitterIdNode.innerText.trim().replace('@', '')
}

function _(main: () => LiveSelector<HTMLElement, false>, signal: AbortSignal) {
    startWatch(
        new MutationObserverWatcher(main()).useForeach((ele, _, meta) => {
            let remover = () => {}
            const remove = () => remover()

            const run = async () => {
                const twitterId = getTwitterId(ele)
                if (!twitterId) return

                const info = getInjectNodeInfo(ele.firstChild as HTMLElement)
                if (!info) return

                const proxy = DOMProxy({ afterShadowRootInit: { mode: process.env.shadowRootMode } })
                proxy.realCurrent = info.element.firstChild as HTMLElement

                const root = createReactRootShadowed(proxy.afterShadow, { untilVisible: true, signal })
                root.render(
                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            zIndex: 2,
                        }}>
                        {info.isTwitterNFT ? (
                            <NFTAvatarMiniClip width={info.width} height={info.height} screenName={twitterId} />
                        ) : (
                            <NFTBadgeTimeline
                                userId={twitterId}
                                avatarId={info.avatarId}
                                width={info.width - 4}
                                height={info.height - 4}
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

export async function injectUserNFTAvatarAtTwitter(signal: AbortSignal) {
    _(postAvatarsContentSelector, signal)
}
