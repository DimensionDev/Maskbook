import { memo } from 'react'
import { noop } from 'lodash-es'
import { makeStyles } from '@masknet/theme'
import { Flags } from '@masknet/flags'
import { DOMProxy, type LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { startWatch } from '../../../../utils/startWatch.js'
import { attachReactTreeWithContainer } from '../../../../utils/shadow-root/renderInShadowRoot.js'
import { getInjectNodeInfo } from '../../utils/avatar.js'
import { NFTBadgeTimeline } from '@masknet/plugin-avatar'
import { searchInstagramPostAvatarSelector } from '../../utils/selector.js'

const useStyles = makeStyles()(() => ({
    root: {
        transform: 'scale(1)!important',
    },
}))

const TimeLineRainbow = memo(
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
                    classes={{
                        root: classes.root,
                    }}
                    userId={userId}
                    avatarId={avatarId}
                    width={width}
                    height={height}
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
                const href = (element.parentNode as HTMLAnchorElement | null)?.href
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
