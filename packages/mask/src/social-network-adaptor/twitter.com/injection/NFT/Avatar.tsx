import { DOMProxy, LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { NFTBadgeTimeline } from '../../../../plugins/Avatar/SNSAdaptor/NFTBadgeTimeline'
import { createReactRootShadowed, startWatch } from '../../../../utils'
import { Flags } from '../../../../../shared'
import { getInjectNodeInfo } from '../../utils/avatar'
import { postAvatarsContentSelector } from '../../utils/selector'

function getTwitterId(ele: HTMLElement) {
    const twitterIdNode = (ele.firstChild?.nextSibling as HTMLElement).querySelector(
        '[dir="ltr"] > span',
    ) as HTMLSpanElement
    if (!twitterIdNode) return
    const twitterId = twitterIdNode.innerText.trim().replace('@', '')
    return twitterId
}

function _(main: () => LiveSelector<HTMLElement, false>, signal: AbortSignal) {
    startWatch(
        new MutationObserverWatcher(main()).useForeach((ele, _, meta) => {
            let remover = () => {}
            const remove = () => remover()

            const run = async () => {
                const twitterId = getTwitterId(ele)
                console.log(twitterId)
                if (!twitterId) return

                const info = getInjectNodeInfo(ele.firstChild as HTMLElement)
                console.log(info)
                if (!info) return

                const proxy = DOMProxy({ afterShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode } })
                proxy.realCurrent = info.element.firstChild as HTMLElement

                const root = createReactRootShadowed(proxy.afterShadow, { signal })
                root.render(
                    <div
                        style={{
                            position: 'absolute',
                            left: -2,
                            top: -2,
                            zIndex: -1,
                        }}>
                        <NFTBadgeTimeline
                            userId={twitterId}
                            avatarId={info.avatarId}
                            width={info.width}
                            height={info.height}
                        />
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

export async function injectUserNFTAvatarAtTwitter(signal: AbortSignal) {
    _(postAvatarsContentSelector, signal)
}
