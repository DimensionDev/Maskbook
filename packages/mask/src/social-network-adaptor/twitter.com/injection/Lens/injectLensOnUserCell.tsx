import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createInjectHooksRenderer, Plugin, useActivatedPluginsSNSAdaptor } from '@masknet/plugin-infra/content-script'
import { EnhanceableSite, ProfileIdentifier } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { useMemo, useState } from 'react'
import { startWatch } from '../../../../utils/watcher.js'
import { querySelectorAll } from '../../utils/selector.js'
import { attachReactTreeWithContainer } from '../../../../utils/index.js'

const selector = () => {
    // [href^="/search"] is a hash tag
    return querySelectorAll<HTMLElement>(
        '[data-testid=UserCell] div > a[role=link]:not([tabindex]):not([href^="/search"]) [dir]:last-of-type',
    )
}

/**
 * Inject on sidebar user cell
 */
export function injectLensOnUserCell(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(selector())
    startWatch(watcher, signal)
    watcher.useForeach((node, _, proxy) => {
        const userId = node.closest('[role=link]')?.getAttribute('href')?.slice(1)
        if (!userId) return
        // Intended to set `untilVisible` to true, but mostly user cells are fixed and visible
        attachReactTreeWithContainer(proxy.afterShadow, { signal }).render(<UserCellLensSlot userId={userId} />)
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

const createRootElement = () => {
    const span = document.createElement('span')
    Object.assign(span.style, {
        verticalAlign: 'bottom',
        height: '21px',
        alignItems: 'center',
        justifyContent: 'center',
        display: 'flex',
    } as CSSStyleDeclaration)
    return span
}

function UserCellLensSlot({ userId }: Props) {
    const [disabled, setDisabled] = useState(true)
    const { classes, cx } = useStyles()

    const component = useMemo(() => {
        const Component = createInjectHooksRenderer(
            useActivatedPluginsSNSAdaptor.visibility.useNotMinimalMode,
            (plugin) => plugin.Lens?.UI?.Content,
            undefined,
            createRootElement,
        )
        if (userId.includes('/')) return null
        const identifier = ProfileIdentifier.of(EnhanceableSite.Twitter, userId).unwrap()
        if (!identifier) return null

        return (
            <Component identity={identifier} slot={Plugin.SNSAdaptor.LensSlot.Sidebar} onStatusUpdate={setDisabled} />
        )
    }, [userId])

    if (!component) return null

    return <span className={cx(classes.slot, disabled ? classes.hide : null)}>{component}</span>
}
