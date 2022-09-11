// @ts-ignore in case circle dependency make typescript complains
import { setService, setPluginMessages, setMessages, setPluginServices, IntegratedDashboard } from '@masknet/dashboard'
import { startPluginDashboard } from '@masknet/plugin-infra/dashboard'
import Services from '../service.js'
import { WalletRPC, WalletMessages } from '../../plugins/Wallet/messages.js'
// import { PluginTransakMessages } from '../../plugins/Transak/messages'
// import { PluginTraderMessages, PluginTraderRPC } from '../../plugins/Trader/messages'
// import { PluginPetMessages } from '../../plugins/Pets/messages'
import { MaskMessages } from '../../utils/messages.js'
import { createPluginHost, createPartialSharedUIContext } from '../../../shared/plugin-infra/host.js'
import type { DashboardPluginMessages, DashboardPluginServices } from '@masknet/shared'
import { createNormalReactRoot } from '../../utils/createNormalReactRoot.js'
import { status } from '../../setup.ui.js'
import { PluginTransakMessages } from '../../plugins/Transak/messages.js'
import { PluginTraderMessages } from '../../plugins/Trader/messages.js'
import { RestPartOfPluginUIContextShared } from '../../utils/plugin-context-shared-ui.js'

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
