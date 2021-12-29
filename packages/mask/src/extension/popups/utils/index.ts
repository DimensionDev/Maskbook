import type { PopupRoutes } from '@masknet/shared-base'
export function getRouteURLWithNoParam(kind: PopupRoutes) {
    return browser.runtime.getURL(`/popups.html#${kind}`)
}
