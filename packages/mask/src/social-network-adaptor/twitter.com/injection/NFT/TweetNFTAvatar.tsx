import { DOMProxy, type LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { NFTBadgeTweet, NFTAvatarMiniClip, RSS3_KEY_SNS, NFTAvatarMiniSquare } from '@masknet/plugin-avatar'
import { MaskMessages, createReactRootShadowed, startWatch } from '../../../../utils/index.js'
import { getInjectNodeInfo } from '../../utils/avatar.js'
import { searchRetweetAvatarSelector, searchTweetAvatarSelector } from '../../utils/selector.js'
import { activatedSocialNetworkUI } from '../../../../social-network/ui.js'
import { noop } from 'lodash-es'
import { AvatarType } from '../../constant.js'

function _(main: () => LiveSelector<HTMLElement>, signal: AbortSignal) {
    startWatch(
        new MutationObserverWatcher(main()).useForeach((ele, _, meta) => {
            let remover = noop
            const remove = () => remover()

            const run = async () => {
                const info = getInjectNodeInfo(ele.firstChild as HTMLElement)
                if (!info) return

                const proxy = DOMProxy({ afterShadowRootInit: { mode: process.env.shadowRootMode } })
                proxy.realCurrent = info.element.firstChild as HTMLElement
                const root = createReactRootShadowed(proxy.afterShadow, { untilVisible: true, signal })
                root.render(
                    <div style={{ position: 'absolute', top: 0, left: 0, zIndex: 2 }}>
                        {info.avatarType === AvatarType.Clip ? (
                            <NFTAvatarMiniClip
                                identity={activatedSocialNetworkUI.collecting.identityProvider?.recognized.value}
                                size={info.width}
                            />
                        ) : info.avatarType === AvatarType.Square ? (
                            <NFTAvatarMiniSquare
                                screenName={
                                    activatedSocialNetworkUI.collecting.identityProvider?.recognized.value.identifier
                                        ?.userId || ''
                                }
                                size={info.height}
                            />
                        ) : (
                            <NFTBadgeTweet
                                timelineUpdated={MaskMessages.events.NFTAvatarTimelineUpdated}
                                identity={activatedSocialNetworkUI.collecting.identityProvider?.recognized.value}
                                width={info.width - 4}
                                height={info.height - 4}
                                avatarId={info.avatarId}
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

export async function injectUserNFTAvatarAtTweet(signal: AbortSignal) {
    _(searchTweetAvatarSelector, signal)
    _(searchRetweetAvatarSelector, signal)
}
