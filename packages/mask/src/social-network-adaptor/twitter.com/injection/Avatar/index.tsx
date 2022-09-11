import { DOMProxy, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { Plugin } from '@masknet/plugin-infra'
import { Avatar } from '../../../../components/InjectedComponents/Avatar.js'
import { createReactRootShadowed, startWatch } from '../../../../utils/index.js'
import { inpageAvatarSelector } from '../../utils/selector.js'
import { getUserIdentity } from '../../utils/user.js'

function getTwitterId(ele: HTMLElement) {
    const profileLink = ele.querySelector('a[role="link"]') as HTMLAnchorElement
    if (!profileLink) return
    return profileLink.getAttribute('href')?.slice(1)
}

export async function injectAvatar(signal: AbortSignal) {
    startWatch(
        new MutationObserverWatcher(inpageAvatarSelector()).useForeach((ele) => {
            let remover = () => {}
            const remove = () => remover()

            const run = async () => {
                const twitterId = getTwitterId(ele)
                if (!twitterId) return

                const proxy = DOMProxy({ afterShadowRootInit: { mode: 'closed' } })
                proxy.realCurrent = ele.firstChild as HTMLElement
                const identity = await getUserIdentity(twitterId)
                const isSuggestion = ele.closest('[data-testid=UserCell]')
                const sourceType = isSuggestion
                    ? Plugin.SNSAdaptor.AvatarRealmSourceType.Suggestion
                    : Plugin.SNSAdaptor.AvatarRealmSourceType.Post

                const root = createReactRootShadowed(proxy.afterShadow, { signal })
                root.render(
                    <div
                        style={{
                            position: 'absolute',
                            right: -4,
                            bottom: -4,
                            width: 16,
                            height: 16,
                            zIndex: 2,
                        }}>
                        {identity ? <Avatar identity={identity} sourceType={sourceType} /> : null}
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
