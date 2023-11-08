import { memo, useMemo, useState } from 'react'
import { MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { createInjectHooksRenderer, Plugin, useActivatedPluginsSiteAdaptor } from '@masknet/plugin-infra/content-script'
import { querySelectorAll } from '../../utils/selector.js'
import { attachReactTreeWithContainer } from '../../../../utils/shadow-root/renderInShadowRoot.js'
import { startWatch } from '../../../../utils/startWatch.js'

function selector() {
    return querySelectorAll<HTMLElement>('[data-testid=UserCell] div > a[role=link][tabindex]:not(:has(img)) > div')
}

interface Props {
    userId: string
}

function createRootElement() {
    return document.createElement('div')
}

const UserCellNameWidgetSlot = memo(function UserCellNameWidgetSlot({ userId }: Props) {
    const [disabled, setDisabled] = useState(true)

    const component = useMemo(() => {
        const Component = createInjectHooksRenderer(
            useActivatedPluginsSiteAdaptor.visibility.useNotMinimalMode,
            (plugin) => plugin.NameWidget?.UI?.Content,
            undefined,
            createRootElement,
        )
        if (userId.includes('/')) return null

        return (
            <Component userId={userId} slot={Plugin.SiteAdaptor.NameWidgetSlot.Sidebar} onStatusUpdate={setDisabled} />
        )
    }, [userId])

    if (!component) return null

    return <div style={{ display: disabled ? 'none' : undefined }}>{component}</div>
})

/**
 * Inject on sidebar user cell
 */
export function injectNameWidgetOnUserCell(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(selector())
    startWatch(watcher, signal)
    watcher.useForeach((node, _, proxy) => {
        const userId = node.closest('[role=link]')?.getAttribute('href')?.slice(1)
        if (!userId) return
        // Intended to set `untilVisible` to true, but mostly user cells are fixed and visible
        attachReactTreeWithContainer(proxy.afterShadow, { signal }).render(<UserCellNameWidgetSlot userId={userId} />)
    })
}
