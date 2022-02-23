import { DOMProxy, LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createReactRootShadowed, startWatch } from '../../../../utils'
import { getInjectNodeInfo } from '../../utils/avatar'
import { Flags } from '../../../../../shared'
import { NFTBadgeTimeline } from '../../../../plugins/Avatar/SNSAdaptor/NFTBadgeTimeline'
import { RSS3_KEY_SNS } from '../../../../plugins/Avatar/constants'
import { searchInstagramPostAvatarSelector } from '../../utils/selector'

function _(selector: () => LiveSelector<HTMLImageElement, false>, signal: AbortSignal) {
    startWatch(
        new MutationObserverWatcher(selector()).useForeach((element) => {
            let remove = () => {}

            const run = async () => {
                const href = (element.parentNode as HTMLAnchorElement)?.href

                if (!href) return

                const id = new URL(href).pathname.replaceAll('/', '')

                if (!id) return

                const info = getInjectNodeInfo(element)

                if (!info) return

                const proxy = DOMProxy({ afterShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode } })
                proxy.realCurrent = info.element

                const root = createReactRootShadowed(proxy.afterShadow, { signal })

                root.render(
                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            zIndex: 2,
                        }}>
                        <NFTBadgeTimeline
                            userId={id}
                            avatarId={info.avatarId}
                            width={info.width - 4}
                            height={info.height - 4}
                            snsKey={RSS3_KEY_SNS.INSTAGRAM}
                        />
                    </div>,
                )

                remove = root.destory
            }

            run()

            return {
                onNodeMutation: run,
                onTargetChanged: run,
                onRemove: () => remove(),
            }
        }),
        signal,
    )
}

export async function injectUserNFTAvatarAtInstagram(signal: AbortSignal) {
    _(searchInstagramPostAvatarSelector, signal)
}
