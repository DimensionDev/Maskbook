// @ts-ignore in case circle dependency make typescript complains
import { setService, setPluginMessages, setMessages, setPluginServices, IntegratedDashboard } from '@masknet/dashboard'
import { startPluginDashboard } from '@masknet/plugin-infra/dashboard'
import Services from '../service'
import { WalletRPC, WalletMessages } from '../../plugins/Wallet/messages'
// import { PluginTransakMessages } from '../../plugins/Transak/messages'
// import { PluginTraderMessages, PluginTraderRPC } from '../../plugins/Trader/messages'
// import { PluginPetMessages } from '../../plugins/Pets/messages'
import { MaskMessages } from '../../utils/messages'
import { createPluginHost, createPartialSharedUIContext } from '../../../shared/plugin-infra/host'
import type { DashboardPluginMessages, DashboardPluginServices } from '@masknet/shared'
import { createNormalReactRoot } from '../../utils/createNormalReactRoot'
import { status } from '../../setup.ui'
import { PluginTransakMessages } from '../../plugins/Transak/messages'
import { PluginTraderMessages } from '../../plugins/Trader/messages'
import { RestPartOfPluginUIContextShared } from '../../utils/plugin-context-shared-ui'

const msg: DashboardPluginMessages = {
    Wallet: WalletMessages,
    Swap: PluginTraderMessages,
    Transak: PluginTransakMessages,
    // Pets: PluginPetMessages,
}
const rpc: DashboardPluginServices = {
    Wallet: WalletRPC,
    // Swap: PluginTraderRPC,
}
// @ts-ignore To avoid build failure due to the circular project reference
setService(Services)
// @ts-ignore
setMessages(MaskMessages)
// @ts-ignore
setPluginServices(rpc)
// @ts-ignore
setPluginMessages(msg)
startPluginDashboard(
    createPluginHost(
        undefined,
        (id, signal) => ({
            ...createPartialSharedUIContext(id, signal),
            ...RestPartOfPluginUIContextShared,
        }),
        Services.Settings.getPluginMinimalModeEnabled,
    ),
)
status.then(() => createNormalReactRoot(<IntegratedDashboard />))
