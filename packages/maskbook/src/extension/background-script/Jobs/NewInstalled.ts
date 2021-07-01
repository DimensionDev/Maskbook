// No meaning for this module to support hmr but I don't want to invalidate dependencies module by this reason.
import { Flags } from '../../../utils/flags'
import { getWelcomePageURL } from '../../options-page/Welcome/getWelcomePageURL'
export default function () {
    browser.runtime.onInstalled.addListener((detail) => {
        if (Flags.has_native_welcome_ui) return
        if (detail.reason === 'install') {
            browser.tabs.create({ url: getWelcomePageURL() })
        }
    })
}
