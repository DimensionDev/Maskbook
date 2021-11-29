import { DOMProxy, LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { NFTContractImage } from '../../../../plugins/Avatar/SNSAdaptor/NFTContractImage'
import { createReactRootShadowed, startWatch } from '../../../../utils'
import { Flags } from '../../../../../shared'
import { postAvatarsContentSelector } from '../../utils/selector'

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

                const nftDom = ele.querySelector(
                    'div > :nth-child(2) > :nth-child(2) > div > div > div > div > div > a > div > div',
                ) as HTMLSpanElement as HTMLElement
                if (!nftDom) return
                const proxy = DOMProxy({ afterShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode } })
                proxy.realCurrent = nftDom
                const root = createReactRootShadowed(proxy.afterShadow, { signal })
                root.render(
                    <div>
                        <NFTContractImage userId={twitterId} />
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

export async function injectNFTContractAtTwitter(signal: AbortSignal) {
    _(postAvatarsContentSelector, signal)
}
