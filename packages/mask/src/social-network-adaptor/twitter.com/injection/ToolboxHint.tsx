import { type LiveSelector, MutationObserverWatcher } from '@dimensiondev/holoflows-kit'
import { ValueRef } from '@masknet/shared-base'
import { useValueRef } from '@masknet/shared-base-ui'
import { attachReactTreeWithContainer } from '../../../utils/shadow-root/renderInShadowRoot.js'
import { querySelector, sideBarProfileSelector } from '../utils/selector.js'
import { ProfileLinkAtTwitter, ToolboxHintAtTwitter } from './ToolboxHint_UI.js'
import { startWatch } from '@masknet/theme'

const SideBarNativeItemTextMarginLeftRef = new ValueRef('20px')
const SideBarNativeItemIconSize = new ValueRef('24px')
const SideBarNativeItemPaddingRef = new ValueRef('11px')

const toolboxInSidebarSelector: () => LiveSelector<HTMLElement, true> = () => {
    // Organization account don't have a [data-testid=AppTabBar_More_Menu] in page. see MF-3866
    return querySelector<HTMLElement>('[role="banner"] nav[role="navigation"] > div[data-testid=AppTabBar_More_Menu]')
}

export function injectToolboxHintAtTwitter(signal: AbortSignal, category: 'wallet' | 'application') {
    const watcher = new MutationObserverWatcher(toolboxInSidebarSelector())
        .addListener('onAdd', updateStyle)
        .addListener('onChange', updateStyle)

    startWatch(watcher, {
        signal,
        missingReportRule: {
            name: 'Sidebar toolbox',
            rule() {
                // return false where the page should not match. maybe on mobile size?
                return true
            },
        },
    })
    attachReactTreeWithContainer(watcher.firstDOMProxy.afterShadow, { signal }).render(
        <ToolboxHintAtTwitter category={category} />,
    )
    injectProfile(signal)
}

function updateStyle() {
    const SideBarNativeItem = document.querySelector('[role="banner"] [role="navigation"] > div > div')
    const SideBarNativeItemText = document.querySelector(
        '[role="banner"] [role="navigation"] > div > div > div[dir="auto"]',
    )
    const SideBarNativeItemIcon = document.querySelector(
        '[role="banner"] [role="navigation"] > div > div > div:first-child',
    )
    const SideBarNativeItemStyle = SideBarNativeItem ? window.getComputedStyle(SideBarNativeItem) : null
    const SideBarNativeItemTextStyle = SideBarNativeItemText ? window.getComputedStyle(SideBarNativeItemText) : null
    const SideBarNativeItemIconStyle = SideBarNativeItemIcon ? window.getComputedStyle(SideBarNativeItemIcon) : null
    SideBarNativeItemPaddingRef.value = SideBarNativeItemStyle?.padding ?? '11px'
    SideBarNativeItemIconSize.value = SideBarNativeItemIconStyle?.width ?? '24px'
    SideBarNativeItemTextMarginLeftRef.value = SideBarNativeItemTextStyle?.marginLeft ?? '20px'
}
export function useSideBarNativeItemStyleVariants() {
    return {
        textMarginLeft: useValueRef(SideBarNativeItemTextMarginLeftRef),
        itemPadding: useValueRef(SideBarNativeItemPaddingRef),
        iconSize: useValueRef(SideBarNativeItemIconSize),
    }
}

function injectProfile(signal: AbortSignal) {
    const watcher = new MutationObserverWatcher(sideBarProfileSelector())
    startWatch(watcher, signal)
    attachReactTreeWithContainer(watcher.firstDOMProxy.beforeShadow, { signal }).render(<ProfileLinkAtTwitter />)
}
