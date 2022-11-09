import { setService, setPluginMessages, setMessages, setPluginServices, IntegratedDashboard } from '@masknet/dashboard'
import { startPluginDashboard } from '@masknet/plugin-infra/dashboard'
import Services from '../service.js'
import { WalletRPC, WalletMessages } from '../../plugins/Wallet/messages.js'
import { MaskMessages } from '../../../shared/messages.js'
import { createPluginHost, createPartialSharedUIContext } from '../../../shared/plugin-infra/host.js'
import { createNormalReactRoot } from '../../utils/createNormalReactRoot.js'
import { status } from '../../setup.ui.js'
import { PluginTransakMessages } from '../../plugins/Transak/messages.js'
import { RestPartOfPluginUIContextShared } from '../../utils/plugin-context-shared-ui.js'

setService(Services)
setMessages(MaskMessages)
setPluginServices({
    Wallet: WalletRPC,
})
setPluginMessages({
    Wallet: WalletMessages.events,
    Transak: PluginTransakMessages,
})
startPluginDashboard(
    createPluginHost(
        undefined,
        (id, signal) => ({
            ...createPartialSharedUIContext(id, signal),
            ...RestPartOfPluginUIContextShared,
        }),
        Services.Settings.getPluginMinimalModeEnabled,
        Services.Helper.hasHostPermission,
    ),
)
status.then(() => createNormalReactRoot(<IntegratedDashboard />))
