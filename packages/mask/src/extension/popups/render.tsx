import { activateSiteAdaptorUI } from '../../setup.ui.js'
import { startPluginDashboard } from '@masknet/plugin-infra/dashboard'
import { createNormalReactRoot } from '../../utils/index.js'
import { createPluginHost, createPartialSharedUIContext } from '../../../shared/plugin-infra/host.js'
import Services from '#services'
import Popups from './UI.js'
import { NextSharedUIContext, RestPartOfPluginUIContextShared } from '../../utils/plugin-context-shared-ui.js'
import { MaskMessages, createSubscriptionFromAsync } from '@masknet/shared-base'
import { __setUIContext__ } from '@masknet/plugin-infra/dom/context'

if (location.hash === '') location.assign('#/personas')
__setUIContext__({
    allPersonas: NextSharedUIContext.allPersonas,
    currentPersona: NextSharedUIContext.currentPersonaIdentifier,
    queryPersonaAvatar: Services.Identity.getPersonaAvatar,
    querySocialIdentity: Services.Identity.querySocialIdentity,
    fetchJSON: Services.Helper.fetchJSON,
    queryPersonaByProfile: Services.Identity.queryPersonaByProfile,
    openDashboard: Services.Helper.openDashboard,
    openPopupWindow: Services.Helper.openPopupWindow,
})

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

    const allPersonaSub = createSubscriptionFromAsync(
        () => Services.Identity.queryOwnedPersonaInformation(true),
        [],
        (x) => {
            const clearCurrentPersonaIdentifier = MaskMessages.events.currentPersonaIdentifier.on(x)
            const clearOwnPersonaChanged = MaskMessages.events.ownPersonaChanged.on(x)

            return () => {
                clearCurrentPersonaIdentifier()
                clearOwnPersonaChanged()
            }
        },
    )

    startPluginDashboard(
        createPluginHost(
            undefined,
            (id, def, signal) => ({
                ...createPartialSharedUIContext(id, def, signal),
                ...RestPartOfPluginUIContextShared,
                allPersonas: allPersonaSub,
                setMinimalMode(enabled) {
                    Services.Settings.setPluginMinimalModeEnabled(id, enabled)
                },
            }),
            Services.Settings.getPluginMinimalModeEnabled,
            Services.Helper.hasHostPermission,
        ),
    )
}
