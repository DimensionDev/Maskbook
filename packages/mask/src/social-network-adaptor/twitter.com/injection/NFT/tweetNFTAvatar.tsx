import { DOMProxy, LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { NFTBadgeTweet } from '../../../../plugins/Avatar/SNSAdaptor/NFTBadgeTweet'
import { createReactRootShadowed, Flags, startWatch } from '../../../../utils'
import { searchRetweetAvatarSelector, searchTweetAvatarSelector } from '../../utils/selector'
import { getAvatarId } from '../../utils/user'

function _(main: () => LiveSelector<HTMLElement, false>, signal: AbortSignal) {
    startWatch(
        new MutationObserverWatcher(main()).useForeach((ele, _, meta) => {
            let remover = () => {}
            const remove = () => remover()

            const run = async () => {
                const nftDom = ele.firstChild?.firstChild as HTMLElement
                if (!nftDom || !nftDom.firstChild) return
                nftDom.style.overflow = 'unset'
                const width = Number(window.getComputedStyle(nftDom).width.replace('px', '') ?? 0)
                const height = Number(window.getComputedStyle(nftDom).height.replace('px', '') ?? 0)

                const avatarIdNodeParent = nftDom.firstChild.firstChild?.firstChild?.nextSibling?.firstChild
                const dom = avatarIdNodeParent?.firstChild as HTMLElement
                if (dom) dom.style.borderRadius = '100%'
                const img = avatarIdNodeParent?.firstChild?.nextSibling as HTMLImageElement
                if (!img) return
                const avatarId = getAvatarId(img.src)
                if (!avatarId) return
                const proxy = DOMProxy({ afterShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode } })
                proxy.realCurrent = nftDom.firstChild as HTMLElement
                const root = createReactRootShadowed(proxy.afterShadow, { signal })
                root.render(
                    <div style={{ position: 'absolute', top: -2, left: -2, zIndex: -1 }}>
                        <NFTBadgeTweet width={width} height={height} avatarId={avatarId} />
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
