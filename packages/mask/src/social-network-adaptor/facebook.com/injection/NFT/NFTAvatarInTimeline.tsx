import {
    DOMProxy,
    type LiveSelector,
    MutationObserverWatcher,
    type UnboundedRegistry,
} from '@dimensiondev/holoflows-kit'
import { MaskMessages, type NFTAvatarEvent, attachReactTreeWithContainer, startWatch } from '../../../../utils/index.js'
import { getInjectNodeInfo } from '../../utils/avatar.js'
import { searchFaceBookPostAvatarOnMobileSelector, searchFaceBookPostAvatarSelector } from '../../utils/selector.js'
import { NFTBadgeTimeline, RSS3_KEY_SNS } from '@masknet/plugin-avatar'
import { isMobileFacebook } from '../../utils/isMobile.js'
import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { noop } from 'lodash-es'

const useStyles = makeStyles()(() => ({
    root: {
        transform: 'scale(1)!important',
    },
}))

const TimelineRainbow = memo(
    ({
        userId,
        avatarId,
        width,
        height,
        timelineUpdated,
    }: {
        userId: string
        avatarId: string
        width: number
        height: number
        timelineUpdated: UnboundedRegistry<NFTAvatarEvent>
    }) => {
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
                    timelineUpdated={timelineUpdated}
                    userId={userId}
                    avatarId={avatarId}
                    width={width}
                    height={height}
                    classes={{ root: classes.root }}
                    snsKey={RSS3_KEY_SNS.FACEBOOK}
                />
            </div>
        )
    },
)

function getFacebookId(element: HTMLElement | SVGElement) {
    const node = (isMobileFacebook ? element.firstChild : element.parentNode?.parentNode) as HTMLLinkElement
    if (!node) return ''
    const url = new URL(node.href, location.href)

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

function _(selector: () => LiveSelector<HTMLElement | SVGElement>, signal: AbortSignal) {
    startWatch(
        new MutationObserverWatcher(selector()).useForeach((element, key) => {
            let remove = noop

            const run = async () => {
                const facebookId = getFacebookId(element)

                if (!facebookId) return

                const info = getInjectNodeInfo(element)

                if (!info) return

                const proxy = DOMProxy({ afterShadowRootInit: { mode: process.env.shadowRootMode } })
                proxy.realCurrent = info.element

                const root = attachReactTreeWithContainer(proxy.afterShadow, { untilVisible: true, signal })

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
                            timelineUpdated={MaskMessages.events.NFTAvatarTimelineUpdated}
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
