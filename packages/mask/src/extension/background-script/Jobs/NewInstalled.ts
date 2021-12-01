// No meaning for this module to support hmr but I don't want to invalidate dependencies module by this reason.
import { Flags } from '../../../../shared'
import { DashboardRoutes } from '@masknet/shared-base'
export default function (signal: AbortSignal) {
    const onInstalled = (detail: { reason: browser.runtime.OnInstalledReason }) => {
        if (Flags.has_native_welcome_ui) return
        if (detail.reason === 'install')
            browser.tabs.create({ url: browser.runtime.getURL(`dashboard.html#${DashboardRoutes.Welcome}`) })
    }
    browser.runtime.onInstalled.addListener(onInstalled)
    signal.addEventListener('abort', () => {
        browser.runtime.onInstalled.removeListener(onInstalled)
    })
}
