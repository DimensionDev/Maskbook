import { Flags } from '../../../shared/flags.js'
import { DashboardRoutes } from '@masknet/shared-base'
import { hmr } from '../../../utils-pure/index.js'

const { signal } = hmr(import.meta.webpackHot)
const onInstalled = (detail: { reason: browser.runtime.OnInstalledReason }) => {
    if (Flags.has_native_welcome_ui) return
    if (detail.reason === 'install')
        browser.tabs.create({ url: browser.runtime.getURL(`dashboard.html#${DashboardRoutes.Welcome}`) })
}
browser.runtime.onInstalled.addListener(onInstalled)
signal.addEventListener('abort', () => {
    browser.runtime.onInstalled.removeListener(onInstalled)
})
