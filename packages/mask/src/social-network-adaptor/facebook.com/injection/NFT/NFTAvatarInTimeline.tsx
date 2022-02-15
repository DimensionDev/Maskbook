import { DOMProxy, LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createReactRootShadowed, startWatch } from '../../../../utils'
import { getInjectNodeInfo } from '../../utils/avatar'
import { searchFaceBookPostAvatarOnMobileSelector, searchFaceBookPostAvatarSelector } from '../../utils/selector'
import { Flags } from '../../../../../shared'
import { NFTBadgeTimeline } from '../../../../plugins/Avatar/SNSAdaptor/NFTBadgeTimeline'
import { isMobileFacebook } from '../../utils/isMobile'

function getFacebookId(element: HTMLElement | SVGElement) {
    const node = (isMobileFacebook ? element.firstChild : element.parentNode?.parentNode) as HTMLLinkElement
    if (!node) return
    if (!isMobileFacebook) return new URL(node.href).searchParams.get('id')
    const match = node.href.match(/lst=(\w+)/)
    if (!match) return
    return match[1]
}

function _(selector: () => LiveSelector<HTMLElement | SVGElement, false>, signal: AbortSignal) {
    startWatch(
        new MutationObserverWatcher(selector()).useForeach((element, key) => {
            let remove = () => {}

            const run = async () => {
                const facebookId = getFacebookId(element)
                if (!facebookId) return

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
                            userId={facebookId}
                            avatarId={info.avatarId}
                            width={info.width - 4}
                            height={info.height - 4}
                        />
                    </div>,
                )

                remove = root.destory
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

export async function injectUserNFTAvatarAtFacebook(signal: AbortSignal) {
    _(isMobileFacebook ? searchFaceBookPostAvatarOnMobileSelector : searchFaceBookPostAvatarSelector, signal)
}
