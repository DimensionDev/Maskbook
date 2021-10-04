import { DOMProxy, LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { NFTBadgeTimeLine } from '../../../../plugins/Avatar/SNSAdaptor/NFTBadgeTimeLIne'
import { createReactRootShadowed, Flags, startWatch } from '../../../../utils'
import { postAvatarsContentSelector } from '../../utils/selector'
import { getAvatarId } from '../../utils/user'

function _(main: () => LiveSelector<HTMLElement, false>, signal: AbortSignal) {
    startWatch(
        new MutationObserverWatcher(main()).useForeach((ele, _, meta) => {
            let remover = () => {}
            const remove = () => remover()

            const run = async () => {
                const twitterIdNode = ele.querySelector(
                    'div > :nth-child(2) > :nth-child(2) > div > div > div > div > div > a > div > :last-child',
                ) as HTMLSpanElement
                if (!twitterIdNode) return
                const twitterId = twitterIdNode.innerText.trim().replace('@', '')
                const avatarIdNode = ele.querySelector(
                    'div > :nth-child(2) > div > div > div > a > div > :last-child > div > img',
                ) as HTMLImageElement
                if (!avatarIdNode) return
                const avatarId = getAvatarId(avatarIdNode.getAttribute('src') ?? '')
                const nftDom = ele.firstChild?.firstChild?.firstChild?.nextSibling?.firstChild
                    ?.firstChild as HTMLElement
                if (!nftDom) return
                const proxy = DOMProxy({ afterShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode } })
                proxy.realCurrent = nftDom
                const root = createReactRootShadowed(proxy.afterShadow, { signal })
                root.render(<NFTBadgeTimeLine userId={twitterId} avatarId={avatarId} />)
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
