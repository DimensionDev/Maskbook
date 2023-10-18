import { activateSiteAdaptorUI } from '../../setup.ui.js'
import { startPluginDashboard } from '@masknet/plugin-infra/dashboard'
import { createNormalReactRoot } from '../../utils/index.js'
import { createPluginHost, createSharedContext } from '../../../shared/plugin-infra/host.js'
import Services from '#services'
import Popups from './UI.js'
import { allPersonas } from '../../../shared-ui/initUIContext.js'

if (location.hash === '') location.assign('#/personas')

/**
 * Firefox will not help popup fixed width when user click browser action
 * So this will determine if the user has set maxWidth to 'unset' when resizing in the window
 */
if (navigator.userAgent.includes('Firefox')) {
    setTimeout(() => {
        document.body.style.maxWidth = '350px'

        window.addEventListener(
            'resize',
            () => {
                if (window.innerWidth !== 400) {
                    document.body.style.maxWidth = 'unset'
                }
            },
            { once: true },
        )
    }, 200)
}
await activateSiteAdaptorUI()
createNormalReactRoot(<Popups />)
startPluginHost()

function startPluginHost() {
    // TODO: Should only load plugins when the page is plugin-aware.

    startPluginDashboard(
        createPluginHost(
            undefined,
            (id, def, signal) => ({
                ...createSharedContext(id, signal),
                allPersonas,
                hasPaymentPassword: Services.Wallet.hasPassword,
                setMinimalMode(enabled) {
                    Services.Settings.setPluginMinimalModeEnabled(id, enabled)
                },
            }),
            Services.Settings.getPluginMinimalModeEnabled,
            Services.Helper.hasHostPermission,
        ),
    )
}
