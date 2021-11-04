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

                const avatarNodeParent = ele.querySelector('div > :nth-child(2) > div > div > div > a') as HTMLElement
                if (!avatarNodeParent || !avatarNodeParent.firstChild) return

                const avatarImageNodeParent = avatarNodeParent.querySelector('div > :last-child > div')
                if (!avatarImageNodeParent) return

                const avatarIdNode = avatarImageNodeParent.querySelector('img') as HTMLImageElement
                if (!avatarIdNode) return
                const avatarId = getAvatarId(avatarIdNode.getAttribute('src') ?? '')

                const proxy = DOMProxy({ afterShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode } })
                proxy.realCurrent = avatarNodeParent.firstChild as HTMLElement

                const width = Number(window.getComputedStyle(avatarNodeParent).width.replace('px', '') ?? 0)
                const height = Number(window.getComputedStyle(avatarNodeParent).height.replace('px', '') ?? 0)
                avatarNodeParent.style.overflow = 'unset'

                const imgNode = avatarImageNodeParent.querySelector('div') as HTMLImageElement
                if (imgNode) imgNode.style.borderRadius = '100%'

                const onClick = () => {
                    window.open(`https://twitter.com/${twitterId}`, '_blank')
                }
                avatarNodeParent.firstChild.addEventListener('click', onClick)

                const root = createReactRootShadowed(proxy.afterShadow, { signal })
                root.render(
                    <div
                        style={{
                            position: 'absolute',
                            left: -2,
                            top: -2,
                            zIndex: -1,
                        }}>
                        <NFTBadgeTimeline userId={twitterId} avatarId={avatarId} width={width} height={height} />
                    </div>,
                )
                remover = () => {
                    root.destory()
                    avatarNodeParent.firstChild?.removeEventListener('click', onClick)
                }
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
