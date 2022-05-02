import { startPluginDashboard } from '@masknet/plugin-infra/dashboard'
import { createNormalReactRoot, MaskMessages } from '../../utils'
import { createPluginHost } from '../../plugin-infra/host'
import { Services } from '../service'
import { status } from '../../setup.ui'
import Popups from './UI'
import { InMemoryStorages, PersistentStorages } from '../../../shared/kv-storage'
import { createSubscriptionFromAsync } from '@masknet/shared-base'

status.then(() => createNormalReactRoot(<Popups />))

// TODO: Should only load plugins when the page is plugin-aware.

startPluginDashboard(
    createPluginHost(undefined, (pluginID, signal) => {
        const currentPersonaSub = createSubscriptionFromAsync(
            Services.Settings.getCurrentPersonaIdentifier,
            undefined,
            MaskMessages.events.currentPersonaIdentifier.on,
            signal,
        )
        return {
            createKVStorage(type, defaultValues) {
                if (type === 'memory') return InMemoryStorages.Plugin.createSubScope(pluginID, defaultValues, signal)
                else return PersistentStorages.Plugin.createSubScope(pluginID, defaultValues, signal)
            },
            personaSign: Services.Identity.signWithPersona,
            walletSign: Services.Ethereum.personalSign,
            currentPersona: currentPersonaSub,
            silentSign: Services.Identity.generateSignResult,
            openPopupWindow: Services.Helper.openPopupWindow,
        }
    }),
)
