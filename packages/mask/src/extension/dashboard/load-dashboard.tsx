import { IntegratedDashboard } from '../../../dashboard/entry.js'
import { DashboardRoutes } from '@masknet/shared-base'
import { createNormalReactRoot } from '../../utils/createNormalReactRoot.js'
import Services from '#services'
import { Modals } from '@masknet/shared'

createNormalReactRoot(
    <IntegratedDashboard>
        <Modals createWallet={() => Services.Helper.openDashboard(DashboardRoutes.CreateMaskWalletForm)} />
    </IntegratedDashboard>,
)
