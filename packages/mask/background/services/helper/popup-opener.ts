import { type DashboardRoutes, PopupRoutes } from '@masknet/shared-base'
import urlcat from 'urlcat'
import { MaskMessages } from '../../../shared/index.js'

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

async function openWindow(url: string): Promise<void> {
    const windows = await browser.windows.getAll()
    const popup = windows.find((win) => win && win.type === 'popup' && win.id === currentPopupWindowId)
    if (popup) {
        await browser.windows.update(currentPopupWindowId, { focused: true })
    } else {
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

            if (process.env.manifest === '2') {
                // @ts-expect-error
                const { screenX, screenY, outerWidth } = window
                top = Math.max(screenY, 0)
                left = Math.max(screenX + (outerWidth - 350), 0)
            } else {
                top = 100
                left = 100
            }
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

const exclusionDetectLocked = [PopupRoutes.PersonaSignRequest, PopupRoutes.Unlock]

export async function openPopupWindow(route?: PopupRoutes, params?: Record<string, any>): Promise<void> {
    const locked = await isLocked()
    const shouldUnlockWallet = locked && !exclusionDetectLocked.includes(route ?? PopupRoutes.Wallet)

    const url = urlcat('popups.html#', shouldUnlockWallet ? PopupRoutes.Unlock : route ?? PopupRoutes.Wallet, {
        toBeClose: 1,
        from: locked && route ? route : null,
        ...params,
    })

    return openWindow(url)
}

export async function openWalletStartUpWindow(params: Record<string, any>) {
    await removePopupWindow()
    return openPopupWindow(PopupRoutes.Wallet, params)
}

export async function openPopupConnectWindow(params: Record<string, any> = {}): Promise<void> {
    const url = urlcat('popups-connect.html#', PopupRoutes.ConnectWallet, {
        toBeClose: 1,
        from: PopupRoutes.ConnectWallet,
        ...params,
    })

    return openWindow(url)
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
