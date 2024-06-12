import urlcat, { type ParamMap } from 'urlcat'
import { type DashboardRoutes, PopupRoutes, MaskMessages, type PopupRoutesParamsMap } from '@masknet/shared-base'
import { isLocked } from '../wallet/services/index.js'

let currentPopupWindowIdPromise: Promise<number | undefined> | undefined

async function openOrFocusPopupWindow(initialURL: string): Promise<void> {
    const currentId = await currentPopupWindowIdPromise
    if (currentId) {
        await browser.windows.update(currentId, { focused: true })
    } else {
        let left: number
        let top: number
        currentPopupWindowIdPromise = (async () => {
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
                url: browser.runtime.getURL(initialURL),
                width: 400,
                height: 628,
                type: 'popup',
                state: 'normal',
                left,
                top,
            })

            // update currentPopupWindowId and clean event
            if (id) {
                browser.windows.onRemoved.addListener(function listener(windowID: number) {
                    if (windowID !== id) return
                    currentPopupWindowIdPromise = undefined
                    browser.windows.onRemoved.removeListener(listener)
                })
            }
            return id
        })()
    }
}
async function openOrUpdatePopupWindow(route: PopupRoutes, params: ParamMap) {
    const currentId = await currentPopupWindowIdPromise
    if (!currentId) return openOrFocusPopupWindow(urlcat('popups.html#', route, params))

    await browser.windows.update(currentId, { focused: true })
    MaskMessages.events.popupRouteUpdated.sendToAll(
        urlcat(route, {
            close_after_unlock: true,
            ...params,
        }),
    )
}

const noWalletUnlockNeeded: PopupRoutes[] = [
    PopupRoutes.PersonaSignRequest,
    PopupRoutes.Personas,
    PopupRoutes.WalletUnlock,
]

export interface OpenPopupWindowOptions {
    bypassWalletLock?: boolean
}
export async function openPopupWindow<T extends PopupRoutes>(
    route: T,
    params: T extends keyof PopupRoutesParamsMap ? PopupRoutesParamsMap[T] : undefined,
    options?: OpenPopupWindowOptions,
): Promise<void> {
    if (noWalletUnlockNeeded.includes(route) || options?.bypassWalletLock || !(await isLocked())) {
        return openOrUpdatePopupWindow(route, {
            close_after_unlock: true,
            ...params,
        })
    } else {
        return openOrUpdatePopupWindow(PopupRoutes.Wallet, {
            close_after_unlock: true,
            from: urlcat(route, params as ParamMap),
        } satisfies PopupRoutesParamsMap[PopupRoutes.Wallet])
    }
}

export async function hasPopupWindowOpened(): Promise<boolean | undefined> {
    return currentPopupWindowIdPromise?.then((id) => !!id)
}

export async function removePopupWindow(): Promise<void> {
    const currentId = await currentPopupWindowIdPromise
    if (!currentId) return
    browser.windows.remove(currentId)
    currentPopupWindowIdPromise = undefined
}

export async function openDashboard(route: DashboardRoutes, search?: string) {
    await browser.tabs.create({
        active: true,
        url: browser.runtime.getURL(`/dashboard.html#${route}${search ? `?${search}` : ''}`),
    })
}

export async function queryCurrentActiveTab() {
    const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true })
    return activeTab
}
