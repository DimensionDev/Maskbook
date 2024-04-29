import { noop } from 'lodash-es'
import { Flags } from '@masknet/flags'
import { Plugin } from '@masknet/plugin-infra'
import { DOMProxy, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { Avatar } from '../../../../components/InjectedComponents/Avatar.js'
import { startWatch } from '../../../../utils/startWatch.js'
import { attachReactTreeWithContainer } from '../../../../utils/shadow-root/renderInShadowRoot.js'
import { querySelectorAll } from '../../utils/selector.js'

function getTwitterId(ele: HTMLElement) {
    const profileLink = ele.querySelector<HTMLAnchorElement>('a[role="link"]')
    return profileLink?.getAttribute('href')?.slice(1)
}

function inpageAvatarSelector() {
    return querySelectorAll<HTMLDivElement>(
        [
            // Avatars in post
            'main[role="main"] [data-testid="cellInnerDiv"] [data-testid="Tweet-User-Avatar"]',
            // Avatars in side panel
            '[data-testid="UserCell"] [data-testid^="UserAvatar-Container-"]',
            // Avatars in space sheet dialog
            '[data-testid=sheetDialog] [data-testid^="UserAvatar-Container-"]',
            // Avatars in space dock
            '[data-testid=SpaceDockExpanded] [data-testid^=UserAvatar-Container-]',
        ].join(','),
    )
}

export async function injectAvatar(signal: AbortSignal) {
    startWatch(
        new MutationObserverWatcher(inpageAvatarSelector()).useForeach((ele) => {
            let remover = noop
            const remove = () => remover()

            const run = async () => {
                const twitterId = getTwitterId(ele)
                if (!twitterId) return

                const proxy = DOMProxy({
                    afterShadowRootInit: Flags.shadowRootInit,
                })
                proxy.realCurrent = ele.firstChild as HTMLElement
                const isSuggestion = ele.closest('[data-testid=UserCell]')
                const sourceType =
                    isSuggestion ?
                        Plugin.SiteAdaptor.AvatarRealmSourceType.Suggestion
                    :   Plugin.SiteAdaptor.AvatarRealmSourceType.Post

                const root = attachReactTreeWithContainer(proxy.afterShadow, { untilVisible: true, signal })
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
                        <Avatar userId={twitterId} sourceType={sourceType} />
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
