import { Flags } from '../../../utils/flags'
import { getUrl } from '../../../utils/utils'
import { DashboardRoute } from '../Route'
import { SetupStep } from '../SetupStep'

export function getWelcomePageURL() {
    if (process.env.target === 'E2E') {
        return getUrl(`index.html#${DashboardRoute.Setup}`)
    } else if (Flags.has_no_browser_tab_ui) {
        return getUrl(`index.html#${DashboardRoute.Nav}`)
    } else {
        return getUrl(`index.html#${DashboardRoute.Setup}/${SetupStep.ConsentDataCollection}`)
    }
}
