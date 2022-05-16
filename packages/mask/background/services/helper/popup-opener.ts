import urlcat from 'urlcat'
import { DashboardRoutes, PopupRoutes } from '@masknet/shared-base'
import { MaskMessages } from '../../../shared'

let currentPopupWindowId = 0
function isLocked() {
    return new Promise<boolean>((resolve) => {
        const off = MaskMessages.events.wallet_is_locked.on(([type, value]) => {
            if (type === 'request') return
            off()
            resolve(value)
            // in case something went wrong
            setTimeout(() => resolve(false), 200)
        })
        MaskMessages.events.wallet_is_locked.sendToLocal(['request'])
    })
}

const exclusionDetectLocked = [PopupRoutes.PersonaSignRequest]

export async function openPopupWindow(route?: PopupRoutes, params?: Record<string, any>): Promise<void> {
    const windows = await browser.windows.getAll()
    const popup = windows.find((win) => win && win.type === 'popup' && win.id === currentPopupWindowId)

    // Focus on the pop-up window if it already exists
    if (popup) {
        await browser.windows.update(currentPopupWindowId, { focused: true })
    } else {
        const locked = await isLocked()
        const shouldUnlockWallet = locked && !exclusionDetectLocked.includes(route ?? PopupRoutes.Wallet)

        const url = urlcat('popups.html#', shouldUnlockWallet ? PopupRoutes.Unlock : route ?? PopupRoutes.Wallet, {
            toBeClose: 1,
            from: locked && route ? route : null,
            ...params,
        })

        let left: number
        let top: number

        try {
            const lastFocused = await browser.windows.getLastFocused()
            // Position window in top right corner of lastFocused window.
            top = lastFocused.top ?? 0
            left = (lastFocused.left ?? 0) + (lastFocused.width ?? 0) - 350
        } catch (error_) {
            // The following properties are more than likely 0, due to being
            // opened from the background chrome process for the extension that
            // has no physical dimensions

            const { screenX, screenY, outerWidth } = window
            top = Math.max(screenY, 0)
            left = Math.max(screenX + (outerWidth - 350), 0)
        }

        const { id } = await browser.windows.create({
            url: browser.runtime.getURL(url),
            width: 350,
            height: 640,
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

            // firefox bug: https://bugzilla.mozilla.org/show_bug.cgi?id=1271047
            if (process.env.engine === 'firefox') {
                browser.windows.update(id, {
                    left,
                    top,
                })
            }
        }
    }
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
