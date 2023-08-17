import urlcat from 'urlcat'
import { type DashboardRoutes, PopupRoutes, CrossIsolationMessages } from '@masknet/shared-base'
import { isLocked } from '../wallet/services/index.js'

let currentPopupWindowId = 0

async function openWindow(url: string): Promise<void> {
    const windows = await browser.windows.getAll()
    const popup = windows.find((win) => win && win.type === 'popup' && win.id === currentPopupWindowId)
    if (popup || currentPopupWindowId) {
        await browser.windows.update(currentPopupWindowId, { focused: true })
    } else {
        let left: number
        let top: number

        try {
            const lastFocused = await browser.windows.getLastFocused()
            // Position window in top right corner of lastFocused window.
            top = lastFocused.top ?? 0
            left = (lastFocused.left ?? 0) + (lastFocused.width ?? 0) - 400
        } catch (error_) {
            // The following properties are more than likely 0, due to being
            // opened from the background chrome process for the extension that
            // has no physical dimensions

            // Note: DOM is only available in MV2 or MV3 page mode.
            const { screenX, outerWidth, screenY } = globalThis as any
            if (typeof screenX === 'number' && typeof outerWidth === 'number') {
                top = Math.max(screenY, 0)
                left = Math.max(screenX + (outerWidth - 400), 0)
            } else {
                top = 100
                left = 100
            }
        }

        const { id } = await browser.windows.create({
            url: browser.runtime.getURL(url),
            width: 400,
            height: 628,
            type: 'popup',
            state: 'normal',
            left,
            top,
        })

        // update currentPopupWindowId and clean event
        if (id) {
            currentPopupWindowId = id
            browser.windows.onRemoved.addListener(function listener(windowID: number) {
                if (windowID === id) {
                    currentPopupWindowId = 0
                }
            })
        }
    }
}

const exclusionDetectLocked: PopupRoutes[] = [PopupRoutes.PersonaSignRequest, PopupRoutes.Unlock, PopupRoutes.Personas]

export async function openPopupWindow(
    route?: PopupRoutes,
    params?: Record<string, any>,
    ignoreLock?: boolean,
): Promise<void> {
    const locked = await isLocked()
    const shouldUnlockWallet = locked && !exclusionDetectLocked.includes(route ?? PopupRoutes.Wallet) && !ignoreLock

    const url = urlcat('popups.html#', shouldUnlockWallet ? PopupRoutes.Unlock : route ?? PopupRoutes.Wallet, {
        toBeClose: 1,
        from: locked && route ? route : null,
        ...params,
    })

    if (currentPopupWindowId) {
        await browser.windows.update(currentPopupWindowId, { focused: true })
        CrossIsolationMessages.events.popupRouteUpdated.sendToAll(
            urlcat(shouldUnlockWallet ? PopupRoutes.Unlock : route ?? PopupRoutes.Wallet, {
                toBeClose: 1,
                from: locked && route ? route : null,
                ...params,
            }),
        )
        return
    }

    return openWindow(url)
}

export async function openWalletStartUpWindow(params: Record<string, any>) {
    await removePopupWindow()
    return openPopupWindow(PopupRoutes.Wallet, params)
}

export async function removePopupWindow(): Promise<void> {
    if (!currentPopupWindowId) return
    browser.windows.remove(currentPopupWindowId)
    currentPopupWindowId = 0
}

export async function openDashboard(route?: DashboardRoutes, search?: string) {
    return browser.tabs.create({
        active: true,
        url: browser.runtime.getURL(`/dashboard.html#${route}${search ? `?${search}` : ''}`),
    })
}

export async function queryCurrentActiveTab() {
    const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true })
    return activeTab
}
