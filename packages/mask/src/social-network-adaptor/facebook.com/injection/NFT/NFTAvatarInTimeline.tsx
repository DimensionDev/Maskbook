import { DOMProxy, LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createReactRootShadowed, startWatch } from '../../../../utils'
import { getInjectNodeInfo } from '../../utils/avatar'
import { searchFaceBookPostAvatarOnMobileSelector, searchFaceBookPostAvatarSelector } from '../../utils/selector'
import { Flags } from '../../../../../shared'
import { NFTBadgeTimeline } from '../../../../plugins/Avatar/SNSAdaptor/NFTBadgeTimeline'
import { isMobileFacebook } from '../../utils/isMobile'
import { RSS3_KEY_SNS } from '../../../../plugins/Avatar/constants'
import { memo } from 'react'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()(() => ({
    root: {
        transform: 'scale(1)!important',
    },
}))

const TimelineRainbow = memo(
    ({ userId, avatarId, width, height }: { userId: string; avatarId: string; width: number; height: number }) => {
        const { classes } = useStyles()
        return (
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    zIndex: 2,
                }}>
                <NFTBadgeTimeline
                    userId={userId}
                    avatarId={avatarId}
                    width={width}
                    height={height}
                    classes={classes}
                    snsKey={RSS3_KEY_SNS.FACEBOOK}
                />
            </div>
        )
    },
)

function getFacebookId(element: HTMLElement | SVGElement) {
    const node = (isMobileFacebook ? element.firstChild : element.parentNode?.parentNode) as HTMLLinkElement
    if (!node) return ''
    const url = new URL(node.href)

    if (url.pathname === '/profile.php' && url.searchParams.get('id')) {
        return url.searchParams.get(isMobileFacebook ? 'lst' : 'id')
    }

    if (url.pathname.includes('/groups')) {
        const match = url.pathname.match(/\/user\/(\w+)\//)
        if (!match) return ''
        return match[1]
    }

    return url.pathname.replace('/', '')
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
                        <TimelineRainbow
                            userId={facebookId}
                            avatarId={info.avatarId}
                            width={info.width - 4}
                            height={info.height - 4}
                        />
                    </div>,
                )

                remove = root.destroy
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

export async function injectUserNFTAvatarAtFacebook(signal: AbortSignal) {
    _(isMobileFacebook ? searchFaceBookPostAvatarOnMobileSelector : searchFaceBookPostAvatarSelector, signal)
}
