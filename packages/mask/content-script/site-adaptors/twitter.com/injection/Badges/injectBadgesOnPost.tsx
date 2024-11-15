import { useMemo, useState } from 'react'
import { EnhanceableSite, ProfileIdentifier } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createInjectHooksRenderer, Plugin, useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script'
import { startWatch } from '../../../../utils/startWatch.js'
import { attachReactTreeWithContainer } from '../../../../utils/shadow-root/renderInShadowRoot.js'
import { querySelectorAll } from '../../utils/selector.js'

function selector() {
    return querySelectorAll<HTMLElement>('[data-testid=User-Name] div').filter((node) => {
        return node.firstElementChild?.matches('a[role=link]:not([tabindex])')
    })
}

// structure: <user-name> <user-id> <timestamp>
export function injectBadgesOnPost(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(selector())
    startWatch(watcher, signal)
    watcher.useForeach((node, _, proxy) => {
        const link = node.querySelector('a[href][role=link]')
        // To simplify the selector above, we do this checking manually
        // <user-id> has tabindex=-1, <timestamp> has a child time element
        if (link?.hasAttribute('tabindex') || link?.querySelector('time')) return
        const href = link?.getAttribute('href')
        const userId = href?.split('/')[1]
        if (!userId) return
        attachReactTreeWithContainer(proxy.afterShadow, { signal, untilVisible: true }).render(
            <PostBadgesSlot userId={userId} />,
        )
    })
}

const useStyles = makeStyles()((theme) => ({
    hide: {
        display: 'none',
    },
    slot: {
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 999,
        marginLeft: theme.spacing(0.5),
        verticalAlign: 'top',
    },
}))

interface Props {
    userId: string
}

function createRootElement() {
    const span = document.createElement('span')
    Object.assign(span.style, {
        alignItems: 'center',
        display: 'flex',
    })
    return span
}
function PostBadgesSlot({ userId }: Props) {
    const [disabled, setDisabled] = useState(true)
    const { classes, cx } = useStyles()

    const component = useMemo(() => {
        const Component = createInjectHooksRenderer(
            useActivatedPluginsSiteAdaptor.visibility.useNotMinimalMode,
            (plugin) => plugin.Badges?.UI?.Content,
            undefined,
            createRootElement,
        )
        const identifier = ProfileIdentifier.of(EnhanceableSite.Twitter, userId).unwrap()
        if (!identifier) return null

        return (
            <Component identity={identifier} slot={Plugin.SiteAdaptor.BadgesSlot.Post} onStatusUpdate={setDisabled} />
        )
    }, [userId])

    if (!component) return null

    return <span className={cx(classes.slot, disabled ? classes.hide : null)}>{component}</span>
}
