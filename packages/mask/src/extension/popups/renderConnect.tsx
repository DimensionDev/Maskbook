import { createNormalReactRoot } from '../../utils/createNormalReactRoot.js'
import PopupsConnect from './connect.js'
import { status } from '../../setup.ui.js'
import { startPluginDashboard } from '@masknet/plugin-infra/dashboard'
import { createPluginHost, createPartialSharedUIContext } from '../../../shared/plugin-infra/host.js'
import { RestPartOfPluginUIContextShared } from '../../utils/plugin-context-shared-ui.js'
import { Services } from '../service.js'
import { MaskMessages, createSubscriptionFromAsync } from '@masknet/shared-base'

status.then(() => createNormalReactRoot(<PopupsConnect />)).then(startPluginHost)

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
