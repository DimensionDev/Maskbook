import { memo } from 'react'
import { noop } from 'lodash-es'
import { Flags } from '@masknet/flags'
import { makeStyles } from '@masknet/theme'
import { NFTBadgeTimeline } from '@masknet/plugin-avatar'
import { DOMProxy, type LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { startWatch } from '../../../../utils/startWatch.js'
import { attachReactTreeWithContainer } from '../../../../utils/shadow-root/renderInShadowRoot.js'
import { getInjectNodeInfo } from '../../utils/avatar.js'
import { searchFaceBookPostAvatarSelector } from '../../utils/selector.js'

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
                    classes={{ root: classes.root }}
                />
            </div>
        )
    },
)

function getFacebookId(element: HTMLElement | SVGElement) {
    const node = element.parentNode?.parentNode as HTMLLinkElement
    if (!node) return ''

    const url = new URL(node.href, location.href)
    if (url.pathname === '/profile.php' && url.searchParams.get('id')) {
        return url.searchParams.get('id')
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

                const proxy = DOMProxy({
                    afterShadowRootInit: Flags.shadowRootInit,
                })
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
    _(searchFaceBookPostAvatarSelector, signal)
}
