import { getUrl } from '../../../utils/utils'
import { DashboardRoute } from '../Route'
import { SetupStep } from '../SetupStep'

export function getWelcomePageURL() {
    if (webpackEnv.target === 'E2E') {
        return getUrl(`index.html#${DashboardRoute.Setup}`)
    } else if (webpackEnv.perferResponsiveTarget === 'xs') {
        return getUrl(`index.html#${DashboardRoute.Nav}`)
    } else {
        return getUrl(`index.html#${DashboardRoute.Setup}/${SetupStep.ConsentDataCollection}`)
    }
}
