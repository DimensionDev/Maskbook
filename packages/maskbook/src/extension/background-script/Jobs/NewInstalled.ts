// No meaning for this module to support hmr but I don't want to invalidate dependencies module by this reason.
import { Flags } from '../../../utils/flags'
import { DashboardRoutes } from '@masknet/shared-base'
export default function () {
    browser.runtime.onInstalled.addListener((detail) => {
        if (Flags.has_native_welcome_ui) return
        if (detail.reason === 'install') {
            const welcomePageURL = browser.runtime.getURL(`dashboard.html#/${DashboardRoutes.Welcome}`)
            browser.tabs.create({ url: welcomePageURL })
        }
    })
}
