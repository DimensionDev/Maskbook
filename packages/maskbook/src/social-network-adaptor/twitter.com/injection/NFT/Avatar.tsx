import { DOMProxy, LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { NFTBadgeTimeline } from '../../../../plugins/Avatar/SNSAdaptor/NFTBadgeTimeline'
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

                const avatarIdNodeParent = ele.querySelector(
                    'div > :nth-child(2) > div > div > div > a > div > :last-child > div',
                )

                if (!avatarIdNodeParent) return

                const avatarIdNode = avatarIdNodeParent.querySelector('img') as HTMLImageElement
                if (!avatarIdNode) return
                const avatarId = getAvatarId(avatarIdNode.getAttribute('src') ?? '')
                const nftDom = ele.firstChild?.firstChild?.firstChild?.nextSibling?.firstChild?.firstChild?.firstChild
                    ?.firstChild?.firstChild as HTMLElement
                if (!nftDom || !nftDom.parentElement) return

                const proxy = DOMProxy({ afterShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode } })
                proxy.realCurrent = nftDom
                const width = Number(window.getComputedStyle(nftDom.parentElement).width.replace('px', '') ?? 0)
                const height = Number(window.getComputedStyle(nftDom.parentElement).height.replace('px', '') ?? 0)
                if (nftDom.parentElement) nftDom.parentElement.style.overflow = 'unset'

                const imgNode = avatarIdNodeParent.querySelector('div') as HTMLImageElement
                if (imgNode) imgNode.style.borderRadius = '100%'

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
                            avatarId={avatarId}
                            width={width + 4}
                            height={height + 4}
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
