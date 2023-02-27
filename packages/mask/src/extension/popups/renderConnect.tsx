import { createNormalReactRoot } from '../../utils/createNormalReactRoot.js'
import PopupsConnect from './connect.js'
import { status } from '../../setup.ui.js'
import { startPluginDashboard } from '@masknet/plugin-infra/dashboard'
import { createPluginHost, createPartialSharedUIContext } from '../../../shared/plugin-infra/host.js'
import { RestPartOfPluginUIContextShared } from '../../utils/plugin-context-shared-ui.js'
import { Services } from '../service.js'
import { createSubscriptionFromAsync } from '@masknet/shared-base'
import { MaskMessages } from '../../utils/messages.js'

status.then(() => createNormalReactRoot(<PopupsConnect />)).then(startPluginHost)

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
