import { startPluginWorker, Plugin } from '@masknet/plugin-infra/background-worker'
import { createSubscriptionFromAsync } from '@masknet/shared-base'
import { InMemoryStorages, MaskMessages, PersistentStorages } from '../../../../shared'
import { createPluginDatabase } from '../../../../background/database/plugin-db'
import { createPluginHost } from '../../../plugin-infra/host'
import { Services } from '../../service'
export default function (signal: AbortSignal) {
    startPluginWorker(createPluginHost(signal, createWorkerContext))
}

function createWorkerContext(pluginID: string, signal: AbortSignal): Plugin.Worker.WorkerContext {
    let storage: Plugin.Worker.DatabaseStorage<any> = undefined!

    const currentPersonaSub = createSubscriptionFromAsync(
        Services.Settings.getCurrentPersonaIdentifier,
        undefined,
        MaskMessages.events.currentPersonaIdentifier.on,
        signal,
    )
    return {
        getDatabaseStorage() {
            return storage || (storage = createPluginDatabase(pluginID, signal))
        },
        createKVStorage(type, defaultValues) {
            if (type === 'memory') return InMemoryStorages.Plugin.createSubScope(pluginID, defaultValues, signal)
            else return PersistentStorages.Plugin.createSubScope(pluginID, defaultValues, signal)
        },
        personaSign: Services.Identity.signWithPersona,
        walletSign: Services.Ethereum.personalSign,
        currentPersona: currentPersonaSub,
        openPopupWindow: Services.Helper.openPopupWindow,
    }
}
