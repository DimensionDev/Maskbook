import { Flags } from '../../../utils/flags'
import { DashboardRoute } from '../Route'
import { SetupStep } from '../SetupStep'

export function getWelcomePageURL() {
    if (Flags.has_no_browser_tab_ui) {
        return browser.runtime.getURL(`index.html#${DashboardRoute.Nav}`)
    } else if (Flags.v2_enabled) {
        return browser.runtime.getURL(`next.html#/welcome`)
    } else {
        return browser.runtime.getURL(`index.html#${DashboardRoute.Setup}/${SetupStep.ConsentDataCollection}`)
    }
}
