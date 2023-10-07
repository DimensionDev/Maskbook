import { IntegratedDashboard } from '../../../dashboard/entry.js'
import { startPluginDashboard } from '@masknet/plugin-infra/dashboard'
import { DashboardRoutes } from '@masknet/shared-base'
import { createPartialSharedUIContext, createPluginHost } from '../../../shared/plugin-infra/host.js'
import { createNormalReactRoot } from '../../utils/createNormalReactRoot.js'
import { NextSharedUIContext, RestPartOfPluginUIContextShared } from '../../utils/plugin-context-shared-ui.js'
import Services from '#services'
import { Modals } from '@masknet/shared'
import { __setUIContext__ } from '@masknet/plugin-infra/dom/context'

__setUIContext__({
    allPersonas: NextSharedUIContext.allPersonas,
    currentPersona: NextSharedUIContext.currentPersonaIdentifier,
    queryPersonaAvatar: Services.Identity.getPersonaAvatar,
})
startPluginDashboard(
    createPluginHost(
        undefined,
        (id, def, signal) => ({
            ...createPartialSharedUIContext(id, def, signal),
            ...RestPartOfPluginUIContextShared,
            allPersonas: NextSharedUIContext.allPersonas,
            setMinimalMode(enabled) {
                Services.Settings.setPluginMinimalModeEnabled(id, enabled)
            },
        }),
        Services.Settings.getPluginMinimalModeEnabled,
        Services.Helper.hasHostPermission,
    ),
)
createNormalReactRoot(
    <IntegratedDashboard>
        <Modals createWallet={() => Services.Helper.openDashboard(DashboardRoutes.CreateMaskWalletForm)} />
    </IntegratedDashboard>,
)
