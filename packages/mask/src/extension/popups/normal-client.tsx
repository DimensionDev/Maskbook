import { status } from '../../setup.ui.js'
import { startPluginDashboard } from '@masknet/plugin-infra/dashboard'
import { createNormalReactRoot, hydrateNormalReactRoot, MaskMessages } from '../../utils/index.js'
import { createPluginHost, createPartialSharedUIContext } from '../../../shared/plugin-infra/host.js'
import { Services } from '../service.js'
import Popups from './UI.js'
import { currentPersonaIdentifier, pluginIDSettings } from '../../../shared/legacy-settings/settings.js'
import { initialPersonaInformation } from './pages/Personas/hooks/PersonaContextInitialData.js'
import { RestPartOfPluginUIContextShared } from '../../utils/plugin-context-shared-ui.js'
import { createSubscriptionFromAsync } from '@masknet/shared-base'

if (location.hash === '#/personas') {
    async function hydrate() {
        console.time('[SSR] Fill data')
        await Promise.all([
            status,
            currentPersonaIdentifier.readyPromise,
            pluginIDSettings.readyPromise,
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
        if (process.env.engine === 'firefox') {
            setTimeout(() => {
                document.body.style.maxWidth = '350px'

                window.addEventListener(
                    'resize',
                    () => {
                        if (window.innerWidth !== 350) {
                            document.body.style.maxWidth = 'unset'
                        }
                    },
                    { once: true },
                )
            }, 200)
        }
        console.timeEnd('[SSR] Hydrate')
    }
    hydrate()
} else {
    status.then(() => createNormalReactRoot(<Popups />)).then(startPluginHost)
}

function startPluginHost() {
    // TODO: Should only load plugins when the page is plugin-aware.

    const allPersonaSub = createSubscriptionFromAsync(
        () => Services.Identity.queryOwnedPersonaInformation(true),
        [],
        MaskMessages.events.currentPersonaIdentifier.on,
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
