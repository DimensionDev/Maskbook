import {
    DOMProxy,
    type LiveSelector,
    MutationObserverWatcher,
    type UnboundedRegistry,
} from '@dimensiondev/holoflows-kit'
import { MaskMessages, type NFTAvatarEvent, attachReactTreeWithContainer, startWatch } from '../../../../utils/index.js'
import { getInjectNodeInfo } from '../../utils/avatar.js'
import { NFTBadgeTimeline, RSS3_KEY_SNS } from '@masknet/plugin-avatar'
import { searchInstagramPostAvatarSelector } from '../../utils/selector.js'
import { memo } from 'react'
import { makeStyles } from '@masknet/theme'
import { noop } from 'lodash-es'
import { Flags } from '@masknet/flags'

const useStyles = makeStyles()(() => ({
    root: {
        transform: 'scale(1)!important',
    },
}))

const TimeLineRainbow = memo(
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
                    classes={{
                        root: classes.root,
                    }}
                    snsKey={RSS3_KEY_SNS.INSTAGRAM}
                />
            </div>
        )
    },
)

function _(selector: () => LiveSelector<HTMLImageElement>, signal: AbortSignal) {
    startWatch(
        new MutationObserverWatcher(selector()).useForeach((element) => {
            let remove = noop

            const run = async () => {
                const href = (element.parentNode as HTMLAnchorElement).href

                if (!href) return

                const id = new URL(href).pathname.replaceAll('/', '')

                if (!id) return

                const info = getInjectNodeInfo(element)

                if (!info) return

                const proxy = DOMProxy({
                    afterShadowRootInit: Flags.shadowRootInit,
                })
                proxy.realCurrent = info.element

                const root = attachReactTreeWithContainer(proxy.afterShadow, { signal })

                root.render(
                    <TimeLineRainbow
                        timelineUpdated={MaskMessages.events.NFTAvatarTimelineUpdated}
                        userId={id}
                        avatarId={info.avatarId}
                        width={info.width - 4}
                        height={info.height - 4}
                    />,
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

export async function injectUserNFTAvatarAtInstagram(signal: AbortSignal) {
    _(searchInstagramPostAvatarSelector, signal)
}
