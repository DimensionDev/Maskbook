import { DOMProxy, type LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { NFTBadgeTimeline, NFTAvatarMiniClip, RSS3_KEY_SNS } from '@masknet/plugin-avatar'
import { MaskMessages, createReactRootShadowed, startWatch } from '../../../../utils/index.js'
import { getInjectNodeInfo } from '../../utils/avatar.js'
import { postAvatarSelector } from '../../utils/selector.js'
import { activatedSocialNetworkUI } from '../../../../social-network/ui.js'

function getUserId(ele: HTMLElement) {
    const attribute = ele?.dataset.testid || ''
    if (attribute.endsWith('unknown')) {
        return ele?.querySelector('a[href][role=link]')?.getAttribute('href')?.slice(1)
    }
    return attribute.split('-').pop()
}

function inject(selector: () => LiveSelector<HTMLElement, false>, signal: AbortSignal) {
    startWatch(
        new MutationObserverWatcher(selector()).useForeach((ele) => {
            let remover = () => {}
            const remove = () => remover()

            const run = async () => {
                const userId = getUserId(ele)
                if (!userId) return

                const info = getInjectNodeInfo(ele)
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
                            <NFTAvatarMiniClip
                                identity={activatedSocialNetworkUI.collecting.identityProvider?.recognized.value}
                                width={info.width}
                                height={info.height}
                                screenName={userId}
                            />
                        ) : (
                            <NFTBadgeTimeline
                                timelineUpdated={MaskMessages.events.NFTAvatarTimelineUpdated}
                                userId={userId}
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
    inject(postAvatarSelector, signal)
}
