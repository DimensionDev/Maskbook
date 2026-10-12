import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { Plugin, createInjectHooksRenderer, useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script'
import { makeStyles, type ReactRootShadowed } from '@masknet/theme'
import { memo, useState } from 'react'
import { useThemeSettings } from '../../../../components/DataSource/useActivatedUI.js'
import { attachReactTreeWithContainer } from '../../../../utils/shadow-root/renderInShadowRoot.js'
import { startWatch } from '../../../../utils/startWatch.js'
import { TipButtonStyle } from '../../constant.js'
import { querySelectorAll } from '../../utils/selector.js'
import { useUserIdentity } from './hooks.js'

function postShareButtonSelector() {
    // The share wrapper is the action-bar cell whose menu button carries no data-testid (the
    // retweet button also has aria-haspopup="menu" but data-testid="retweet").
    // Never match by :last-child here: the injected tips span is appended right after the
    // wrapper, which un-matches a :last-child selector and makes the watcher add/remove the
    // slot forever — the button flickers in/out at MutationObserver cadence.
    return querySelectorAll(
        'article[data-testid="tweet"] [role="group"] > div:has(button[aria-haspopup="menu"]:not([data-testid]))',
    )
}

function getUserId(ele: HTMLElement) {
    const avatar = ele
        .closest('[data-testid="tweet"]')
        ?.querySelector<HTMLElement>('[data-testid^="UserAvatar-Container-"]')
    if (!avatar) return
    return avatar.dataset.testid?.slice(21) // "UserAvatar-Container-".length === 21
}

function createRootElement() {
    const root = document.createElement('div')
    Object.assign(root.style, {
        height: '100%',
        display: 'flex',
        alignItems: 'center',
    })
    return root
}

export function injectTipsButtonOnPost(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(postShareButtonSelector())
    startWatch(
        watcher.useForeach((ele, _, proxy) => {
            let root: ReactRootShadowed | undefined
            let mountedUserId: string | undefined

            const run = () => {
                // `ele` is the watcher proxy's live node: reads follow the current DOM even
                // after X replaces the action bar, and the proxy re-anchors itself then.
                const userId = getUserId(ele)
                // The avatar may not exist yet when the action bar first matches; retry on
                // the next mutation.
                if (!userId) return
                // Tweets mutate constantly (counters, virtualization, hover states) and every
                // mutation used to tear the whole React tree down and remount it, so the
                // rendered button vanished while the fresh tree re-resolved identity/accounts
                // — and a teardown racing a node replacement could leave the live slot empty
                // with the tree orphaned off-DOM. Remount only when the author changes.
                if (userId === mountedUserId) return
                root?.destroy()
                root = attachReactTreeWithContainer(proxy.afterShadow, {
                    signal,
                    tag: createRootElement,
                })
                root.render(<PostTipsSlot userId={userId} />)
                mountedUserId = userId
            }

            run()
            return {
                onNodeMutation: run,
                onTargetChanged: run,
                onRemove: () => root?.destroy(),
            }
        }),
        signal,
    )
}

const useStyles = makeStyles()(() => ({
    disabled: {
        display: 'none',
    },
}))

interface Props {
    userId: string
}

const Component = createInjectHooksRenderer(
    useActivatedPluginsSiteAdaptor.visibility.useNotMinimalMode,
    (plugin) => plugin.TipsRealm?.UI?.Content,
)
const PostTipsSlot = memo(function PostTipsSlot({ userId }: Props) {
    const themeSetting = useThemeSettings()
    const tipStyle = TipButtonStyle[themeSetting.size]
    const { classes } = useStyles()
    const identity = useUserIdentity(userId)

    const [disabled, setDisabled] = useState(true)

    if (!identity?.identifier) return null

    return (
        <span className={disabled ? classes.disabled : undefined}>
            <Component
                identity={identity?.identifier}
                buttonSize={tipStyle.buttonSize}
                iconSize={tipStyle.iconSize}
                slot={Plugin.SiteAdaptor.TipsSlot.Post}
                onStatusUpdate={setDisabled}
            />
        </span>
    )
})
