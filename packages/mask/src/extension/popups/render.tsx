import { startPluginDashboard } from '@masknet/plugin-infra'
import { createNormalReactRoot } from '../../utils'
import { createPluginHost } from '../../../src/plugin-infra/host'
import { status } from '../../setup.ui'
import Popups from './UI'
import { InMemoryStorages, PersistentStorages } from '../../../shared/kv-storage'

status.then(() => createNormalReactRoot(<Popups />))

// TODO: Should only load plugins when the page is plugin-aware.
startPluginDashboard(
    createPluginHost(undefined, (pluginID, signal) => {
        return {
            createKVStorage(type, defaultValues) {
                if (type === 'memory') return InMemoryStorages.Plugin.createSubScope(pluginID, defaultValues, signal)
                else return PersistentStorages.Plugin.createSubScope(pluginID, defaultValues, signal)
            },
        }
    }),
)
