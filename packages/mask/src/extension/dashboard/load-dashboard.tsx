import { IntegratedDashboard } from '../../../dashboard/entry.js'
import { startPluginDashboard } from '@masknet/plugin-infra/dashboard'
import { DashboardRoutes } from '@masknet/shared-base'
import { createSharedContext, createPluginHost } from '../../../shared/plugin-infra/host.js'
import { createNormalReactRoot } from '../../utils/createNormalReactRoot.js'
import { NextSharedUIContext, RestPartOfPluginUIContextShared } from '../../utils/plugin-context-shared-ui.js'
import Services from '#services'
import { Modals } from '@masknet/shared'
import { __setUIContext__ } from '@masknet/plugin-infra/dom/context'

__setUIContext__({
    allPersonas: NextSharedUIContext.allPersonas,
    currentPersona: NextSharedUIContext.currentPersonaIdentifier,
    queryPersonaAvatar: Services.Identity.getPersonaAvatar,
    querySocialIdentity: Services.Identity.querySocialIdentity,
    fetchJSON: Services.Helper.fetchJSON,
    queryPersonaByProfile: Services.Identity.queryPersonaByProfile,
    openDashboard: Services.Helper.openDashboard,
    openPopupWindow: Services.Helper.openPopupWindow,
    signWithPersona: (a, b, c, d) => Services.Identity.signWithPersona(a, b, c, location.origin, d),
})
startPluginDashboard(
    createPluginHost(
        undefined,
        (id, def, signal) => ({
            ...createSharedContext(id, signal),
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
