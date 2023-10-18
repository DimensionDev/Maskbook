import { IntegratedDashboard } from '../../../dashboard/entry.js'
import { startPluginDashboard } from '@masknet/plugin-infra/dashboard'
import { DashboardRoutes } from '@masknet/shared-base'
import { createSharedContext, createPluginHost } from '../../../shared/plugin-infra/host.js'
import { createNormalReactRoot } from '../../utils/createNormalReactRoot.js'
import { allPersonas } from '../../../shared-ui/initUIContext.js'
import Services from '#services'
import { Modals } from '@masknet/shared'

startPluginDashboard(
    createPluginHost(
        undefined,
        (id, def, signal) => ({
            ...createSharedContext(id, signal),
            hasPaymentPassword: Services.Wallet.hasPassword,
            allPersonas,
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
