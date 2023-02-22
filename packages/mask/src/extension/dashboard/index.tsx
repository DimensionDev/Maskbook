import { setService, setPluginMessages, setMessages, setPluginServices, IntegratedDashboard } from '@masknet/dashboard'
import { startPluginDashboard } from '@masknet/plugin-infra/dashboard'
import { PluginTransakMessages } from '@masknet/plugin-transak'
import { createSubscriptionFromAsync } from '@masknet/shared-base'
import { WalletMessages } from '@masknet/plugin-wallet'
import Services from '../service.js'
import { WalletRPC } from '../../plugins/Wallet/messages.js'
import { MaskMessages } from '../../../shared/messages.js'
import { createPluginHost, createPartialSharedUIContext } from '../../../shared/plugin-infra/host.js'
import { createNormalReactRoot } from '../../utils/createNormalReactRoot.js'
import { status } from '../../setup.ui.js'
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
            allPersonas: createSubscriptionFromAsync(
                () => Services.Identity.queryOwnedPersonaInformation(true),
                [],
                MaskMessages.events.currentPersonaIdentifier.on,
            ),
        }),
        Services.Settings.getPluginMinimalModeEnabled,
        Services.Helper.hasHostPermission,
    ),
)
status.then(() => createNormalReactRoot(<IntegratedDashboard />))
