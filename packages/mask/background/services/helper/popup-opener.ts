import urlcat, { type ParamMap } from 'urlcat'
import { type DashboardRoutes, PopupRoutes, MaskMessages, type PopupRoutesParamsMap } from '@masknet/shared-base'
import { isLocked } from '../wallet/services/index.js'

let currentPopupWindowId = 0

async function openWindow(url: string): Promise<void> {
    const windows = await browser.windows.getAll()
    const popup = windows.find((window) => window?.type === 'popup' && window.id === currentPopupWindowId)
    if (popup) {
        await browser.windows.update(popup.id!, { focused: true })
    } else {
        let left: number
        let top: number

        try {
            const lastFocused = await browser.windows.getLastFocused()
            // Position window in top right corner of lastFocused window.
            top = lastFocused.top ?? 0
            left = (lastFocused.left ?? 0) + (lastFocused.width ?? 0) - 400
        } catch {
            // The following properties are more than likely 0, due to being
            // opened from the background chrome process for the extension that
            // has no physical dimensions

            // Note: DOM is only available in MV2 or MV3 page mode.
            const { screenX, outerWidth, screenY } = globalThis as any
            if (typeof screenX === 'number' && typeof screenY === 'number' && typeof outerWidth === 'number') {
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
                if (windowID !== id) return
                currentPopupWindowId = 0
                browser.windows.onRemoved.removeListener(listener)
            })
        }
    }
}
async function openOrUpdatePopupWindow(route: PopupRoutes, params: ParamMap) {
    const url = urlcat('popups.html#', route, params)
    if (!currentPopupWindowId) return openWindow(url)

    await browser.windows.update(currentPopupWindowId, { focused: true })
    MaskMessages.events.popupRouteUpdated.sendToAll(
        urlcat(route, {
            closeAfterDone: true,
            ...params,
        }),
    )
}

const noWalletUnlockNeeded: PopupRoutes[] = [PopupRoutes.PersonaSignRequest, PopupRoutes.Unlock, PopupRoutes.Personas]

export async function openPopupWindow<T extends PopupRoutes>(
    route: T,
    params: T extends keyof PopupRoutesParamsMap ? PopupRoutesParamsMap[T] : undefined,
    evenWhenWalletLocked?: boolean,
): Promise<void> {
    if (noWalletUnlockNeeded.includes(route) || evenWhenWalletLocked || !(await isLocked())) {
        return openOrUpdatePopupWindow(route, {
            closeAfterDone: true,
            ...params,
        })
    } else {
        return openOrUpdatePopupWindow(PopupRoutes.Unlock, {
            closeAfterDone: true,
            from: urlcat(route, params as ParamMap),
        } satisfies PopupRoutesParamsMap[PopupRoutes.Unlock])
    }
}

export async function queryCurrentPopupWindowId() {
    return currentPopupWindowId
}

export async function openWalletStartUpWindow() {
    await removePopupWindow()
    return openPopupWindow(PopupRoutes.Wallet, {})
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
