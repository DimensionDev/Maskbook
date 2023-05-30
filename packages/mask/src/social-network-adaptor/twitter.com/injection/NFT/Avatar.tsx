import { DOMProxy, type LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { attachReactTreeWithContainer, startWatch } from '../../../../utils/index.js'
import { getInjectNodeInfo } from '../../utils/avatar.js'
import { followUserAvatarSelector, postAvatarSelector } from '../../utils/selector.js'
import { activatedSocialNetworkUI } from '../../../../social-network/ui.js'
import { MiniAvatarBorder } from './MiniAvatarBorder.js'

function getUserId(ele: HTMLElement) {
    const attribute = ele.dataset.testid || ''
    if (attribute.endsWith('unknown')) {
        return ele?.querySelector('a[href][role=link]')?.getAttribute('href')?.slice(1)
    }
    return attribute.split('-').pop()
}

function inject(selector: () => LiveSelector<HTMLElement>, signal: AbortSignal) {
    startWatch(
        new MutationObserverWatcher(selector()).useForeach((ele) => {
            let remover: () => void | undefined

            const run = async () => {
                const userId = getUserId(ele)
                if (!userId) return

                const info = getInjectNodeInfo(ele)
                if (!info) return
                const proxy = DOMProxy({ afterShadowRootInit: { mode: process.env.shadowRootMode } })
                proxy.realCurrent = info.element.firstChild as HTMLElement

                const root = attachReactTreeWithContainer(proxy.afterShadow, { untilVisible: true, signal })
                root.render(
                    <div
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            zIndex: 2,
                        }}>
                        <MiniAvatarBorder
                            avatarType={info.avatarType}
                            size={info.width}
                            screenName={
                                userId ||
                                activatedSocialNetworkUI.collecting.identityProvider?.recognized.value.identifier
                                    ?.userId ||
                                ''
                            }
                            avatarId={info.avatarId}
                        />
                    </div>,
                )
                remover = root.destroy
            }

            run()
            return {
                onNodeMutation: run,
                onTargetChanged: run,
                onRemove: () => remover?.(),
            }
        }),
        signal,
    )
}

export async function injectUserNFTAvatarAtTwitter(signal: AbortSignal) {
    inject(postAvatarSelector, signal)
    inject(followUserAvatarSelector, signal)
}
