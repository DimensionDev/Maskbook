import { DOMProxy, LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { getNFTAvatar } from '../../../../components/InjectedComponents/NFT/NFTAvatar'
import { NFTBadge } from '../../../../components/InjectedComponents/NFT/NFTBadge'
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
                const avatar = await getNFTAvatar(twitterId)
                if (!avatar) return
                const avatarIdNode = ele.querySelector(
                    'div > :nth-child(2) > div > div > div > a > div > :last-child > div > img',
                ) as HTMLImageElement
                if (!avatarIdNode) return
                const avatarId = getAvatarId(avatarIdNode.getAttribute('src') ?? '')
                if (avatarId !== avatar.avatarId) return
                const nftDom = ele.firstChild?.firstChild?.lastChild?.firstChild?.firstChild?.firstChild as HTMLElement
                if (!nftDom) return
                const proxy = DOMProxy({ afterShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode } })
                proxy.realCurrent = nftDom
                const root = createReactRootShadowed(proxy.afterShadow, { signal })
                root.render(<NFTBadge avatar={avatar} />)
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
