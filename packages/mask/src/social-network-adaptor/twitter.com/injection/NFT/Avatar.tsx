import { DOMProxy, LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { NFTBadgeTimeline, NFTAvatarMiniClip, RSS3_KEY_SNS } from '@masknet/plugin-avatar'
import { MaskMessages, createReactRootShadowed, startWatch } from '../../../../utils/index.js'
import { getInjectNodeInfo } from '../../utils/avatar.js'
import { postAvatarsContentSelector } from '../../utils/selector.js'
import { activatedSocialNetworkUI } from '../../../../social-network/ui.js'

function getTwitterId(ele: HTMLElement) {
    const twitterIdNodes = (ele.firstChild?.nextSibling as HTMLElement).querySelectorAll<HTMLElement>(
        '[dir="ltr"] > span',
    )
    for (const node of twitterIdNodes) {
        const id = node.innerText
        if (id?.startsWith('@')) return id.replace('@', '')
    }

    return
}

function _(main: () => LiveSelector<HTMLElement, false>, signal: AbortSignal) {
    startWatch(
        new MutationObserverWatcher(main()).useForeach((ele, _, meta) => {
            let remover = () => {}
            const remove = () => remover()

            const run = async () => {
                const twitterId = getTwitterId(ele)
                if (!twitterId) return

                const info = getInjectNodeInfo(ele.firstChild as HTMLElement)
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
                                screenName={twitterId}
                            />
                        ) : (
                            <NFTBadgeTimeline
                                timelineUpdated={MaskMessages.events.NFTAvatarTimelineUpdated}
                                userId={twitterId}
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
    _(postAvatarsContentSelector, signal)
}
