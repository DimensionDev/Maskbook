import { activateSiteAdaptorUI } from '../../setup.ui.js'
import { startPluginDashboard } from '@masknet/plugin-infra/dashboard'
import { createNormalReactRoot, hydrateNormalReactRoot } from '../../utils/index.js'
import { createPluginHost, createPartialSharedUIContext } from '../../../shared/plugin-infra/host.js'
import Services from '#services'
import Popups from './UI.js'
import { NextSharedUIContext, RestPartOfPluginUIContextShared } from '../../utils/plugin-context-shared-ui.js'
import {
    MaskMessages,
    createSubscriptionFromAsync,
    currentPersonaIdentifier,
    pluginIDsSettings,
} from '@masknet/shared-base'
import { initialPersonaInformation } from '@masknet/shared'
import { __setUIContext__ } from '@masknet/plugin-infra/dom/context'

__setUIContext__({
    allPersonas: NextSharedUIContext.allPersonas,
    currentPersona: NextSharedUIContext.currentPersonaIdentifier,
    queryPersonaAvatar: Services.Identity.getPersonaAvatar,
    querySocialIdentity: Services.Identity.querySocialIdentity,
    fetchJSON: Services.Helper.fetchJSON,
    queryPersonaByProfile: Services.Identity.queryPersonaByProfile,
})
if (
    location.hash === '#/personas' ||
    (location.hash.includes('#/personas') && location.hash.includes('tab=Connected+Wallets'))
) {
    console.time('[SSR] Fill data')
    await Promise.all([
        activateSiteAdaptorUI(),
        currentPersonaIdentifier.readyPromise,
        pluginIDsSettings.readyPromise,
        Services.Identity.queryOwnedPersonaInformation(false).then((value) =>
            initialPersonaInformation.setServerSnapshot(value),
        ),
    ])
    console.timeEnd('[SSR] Fill data')

    hydrateNormalReactRoot(<Popups />)
    setTimeout(startPluginHost, 200)

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
    console.timeEnd('[SSR] Hydrate')
} else {
    await activateSiteAdaptorUI()
    createNormalReactRoot(<Popups />)
    startPluginHost()
}

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
