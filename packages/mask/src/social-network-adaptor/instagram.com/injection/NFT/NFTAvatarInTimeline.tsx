import { DOMProxy, LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createReactRootShadowed, startWatch } from '../../../../utils'
import { getInjectNodeInfo } from '../../utils/avatar'
import { Flags } from '../../../../../shared'
import { NFTBadgeTimeline } from '../../../../plugins/Avatar/SNSAdaptor/NFTBadgeTimeline'
import { RSS3_KEY_SNS } from '../../../../plugins/Avatar/constants'
import { searchInstagramPostAvatarSelector } from '../../utils/selector'
import { memo } from 'react'
import { makeStyles } from '@masknet/theme'

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
                    userId={userId}
                    avatarId={avatarId}
                    width={width}
                    height={height}
                    classes={classes}
                    snsKey={RSS3_KEY_SNS.INSTAGRAM}
                />
            </div>
        )
    },
)

function _(selector: () => LiveSelector<HTMLImageElement, false>, signal: AbortSignal) {
    startWatch(
        new MutationObserverWatcher(selector()).useForeach((element) => {
            let remove = () => {}

            const run = async () => {
                const href = (element.parentNode as HTMLAnchorElement)?.href

                if (!href) return

                const id = new URL(href).pathname.replaceAll('/', '')

                if (!id) return

                const info = getInjectNodeInfo(element)

                if (!info) return

                const proxy = DOMProxy({ afterShadowRootInit: { mode: Flags.using_ShadowDOM_attach_mode } })
                proxy.realCurrent = info.element

                const root = createReactRootShadowed(proxy.afterShadow, { signal })

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
