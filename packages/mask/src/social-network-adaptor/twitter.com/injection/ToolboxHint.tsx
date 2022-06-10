import { MutationObserverWatcher, ValueRef } from '@dimensiondev/holoflows-kit'
import { createReactRootShadowed } from '../../../utils/shadow-root/renderInShadowRoot'
import { useValueRef } from '@masknet/shared-base-ui'
import { sideBarProfileSelector, toolBoxInSideBarSelector } from '../utils/selector'
import { startWatch } from '../../../utils/watcher'
import { ProfileLinkAtTwitter, ToolboxHintAtTwitter } from './ToolboxHint_UI'

const SideBarNativeItemTextMarginLeftRef = new ValueRef('20px')
const SideBarNativeItemIconSize = new ValueRef('24px')
const SideBarNativeItemPaddingRef = new ValueRef('11px')

export function injectToolboxHintAtTwitter(signal: AbortSignal, category: 'wallet' | 'application') {
    const watcher = new MutationObserverWatcher(toolBoxInSideBarSelector())
        .addListener('onAdd', updateStyle)
        .addListener('onChange', updateStyle)
        .startWatch(
            {
                childList: true,
                subtree: true,
            },
            signal,
        )

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
    createReactRootShadowed(watcher.firstDOMProxy.afterShadow, { signal }).render(
        <ToolboxHintAtTwitter category={category} />,
    )
    injectProfile(signal)
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
    createReactRootShadowed(watcher.firstDOMProxy.beforeShadow, { signal }).render(<ProfileLinkAtTwitter />)
}
