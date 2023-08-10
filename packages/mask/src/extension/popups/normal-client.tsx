import { activateSiteAdaptorUI } from '../../setup.ui.js'
import { startPluginDashboard } from '@masknet/plugin-infra/dashboard'
import { createNormalReactRoot, hydrateNormalReactRoot } from '../../utils/index.js'
import { createPluginHost, createPartialSharedUIContext } from '../../../shared/plugin-infra/host.js'
import { Services } from '../service.js'
import Popups from './UI.js'
import { RestPartOfPluginUIContextShared } from '../../utils/plugin-context-shared-ui.js'
import {
    MaskMessages,
    createSubscriptionFromAsync,
    currentPersonaIdentifier,
    pluginIDsSettings,
} from '@masknet/shared-base'
import { initialPersonaInformation } from '@masknet/shared'

if (location.hash === '#/personas' || location.hash.includes('#/personas?tab')) {
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
            (id, signal) => ({
                ...createPartialSharedUIContext(id, signal),
                ...RestPartOfPluginUIContextShared,
                allPersonas: allPersonaSub,
            }),
            Services.Settings.getPluginMinimalModeEnabled,
            Services.Helper.hasHostPermission,
        ),
    )
}
