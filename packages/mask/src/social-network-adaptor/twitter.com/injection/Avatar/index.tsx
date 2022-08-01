import { DOMProxy, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { Twitter } from '@masknet/web3-providers'
import { ProfileIdentifier } from '@masknet/shared-base'
import { AvatarSlot } from '../../../../components/InjectedComponents/AvatarSlot'
import { createReactRootShadowed, startWatch } from '../../../../utils'
import { inpageAvatarSelector } from '../../utils/selector'
import { twitterBase } from '../../base'

function getTwitterId(ele: HTMLElement) {
    const profileLink = ele.querySelector('a[role="link"]') as HTMLAnchorElement
    if (!profileLink) return
    return profileLink.getAttribute('href')?.slice(1)
}

export async function injectAvatarSlot(signal: AbortSignal) {
    console.log('injection avatar slot startWatch')
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

                const root = createReactRootShadowed(proxy.afterShadow, { signal })
                console.log('injection avatar slot')
                root.render(
                    <div
                        data-testid="avatar-slot"
                        style={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            width: '100%',
                            height: '100%',
                            zIndex: 2,
                        }}>
                        {identity ? <AvatarSlot identity={identity} /> : null}
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

async function getUserIdentity(twitterId: string) {
    const user = await Twitter.getUserByScreenName(twitterId)
    if (!user?.legacy) return null

    const nickname = user.legacy.name
    const handle = user.legacy.screen_name
    const avatar = user.legacy.profile_image_url_https.replace(/_normal(\.\w+)$/, '_400x400$1')
    const bio = user.legacy.description
    const homepage = user.legacy.entities.url?.urls[0]?.expanded_url ?? ''

    return {
        identifier: ProfileIdentifier.of(twitterBase.networkIdentifier, handle).unwrapOr(undefined),
        nickname,
        avatar,
        bio,
        homepage,
    }
}
