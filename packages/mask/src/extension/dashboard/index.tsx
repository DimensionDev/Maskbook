import { IntegratedDashboard, setMessages, setPluginMessages, setPluginServices, setService } from '@masknet/dashboard'
import { startPluginDashboard } from '@masknet/plugin-infra/dashboard'
import { PluginTransakMessages } from '@masknet/plugin-transak'
import { MaskMessages, createSubscriptionFromAsync } from '@masknet/shared-base'
import { createPartialSharedUIContext, createPluginHost } from '../../../shared/plugin-infra/host.js'
import { WalletRPC } from '../../plugins/WalletService/messages.js'
import { status } from '../../setup.ui.js'
import { createNormalReactRoot } from '../../utils/createNormalReactRoot.js'
import { RestPartOfPluginUIContextShared } from '../../utils/plugin-context-shared-ui.js'
import Services from '../service.js'

setService(Services)
setMessages(MaskMessages)
setPluginServices({
    Wallet: WalletRPC,
})
setPluginMessages({
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
                (x) => {
                    const clearCurrentPersonaIdentifier = MaskMessages.events.currentPersonaIdentifier.on(x)
                    const clearPersonasChanged = MaskMessages.events.personasChanged.on(x)

                    return () => {
                        clearCurrentPersonaIdentifier()
                        clearPersonasChanged()
                    }
                },
            ),
        }),
        Services.Settings.getPluginMinimalModeEnabled,
        Services.Helper.hasHostPermission,
    ),
)
status.then(() => createNormalReactRoot(<IntegratedDashboard />))
