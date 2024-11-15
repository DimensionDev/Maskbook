import { useMemo, useState } from 'react'
import { makeStyles } from '@masknet/theme'
import { EnhanceableSite, ProfileIdentifier } from '@masknet/shared-base'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createInjectHooksRenderer, Plugin, useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script'
import { startWatch } from '../../../../utils/startWatch.js'
import { attachReactTreeWithContainer } from '../../../../utils/shadow-root/renderInShadowRoot.js'
import { querySelectorAll } from '../../utils/selector.js'

function avatarSelector() {
    return querySelectorAll<HTMLElement>(
        '[data-testid=SpaceDockExpanded] [data-testid^=UserAvatar-Container-],[data-testid=sheetDialog] [data-testid^=UserAvatar-Container-]',
    ).map((node) => {
        const span = node.parentElement?.parentElement?.nextElementSibling?.querySelector('div > span + span > span')
        return span
    })
}

/**
 * Inject on space dock
 */
export function injectBadgesOnSpaceDock(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(avatarSelector())
    startWatch(watcher, signal)
    watcher.useForeach((node, _, proxy) => {
        const avatar = node
            .closest('div[dir]')
            ?.previousElementSibling?.querySelector<HTMLElement>('[data-testid^=UserAvatar-Container-]')
        if (!avatar) return
        const userId = avatar.dataset.testid?.slice('UserAvatar-Container-'.length)
        if (!userId) return
        attachReactTreeWithContainer(proxy.afterShadow, { signal, untilVisible: true }).render(
            <SpaceDockBadgesSlot userId={userId} />,
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
        verticalAlign: 'bottom',
        height: '21px',
        alignItems: 'center',
        justifyContent: 'center',
        display: 'inline-flex',
    } as CSSStyleDeclaration)
    return span
}

function SpaceDockBadgesSlot({ userId }: Props) {
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
            <Component
                identity={identifier}
                slot={Plugin.SiteAdaptor.BadgesSlot.Sidebar}
                onStatusUpdate={setDisabled}
            />
        )
    }, [userId])

    if (!component) return null

    return <span className={cx(classes.slot, disabled ? classes.hide : null)}>{component}</span>
}
