// TODO: Ad-hoc fix, if this appears multiple times in the codebase, consider bring our plugin infra back here.

import { setupStorage } from '@masknet/plugin-trader'
import { PersistentStorages, PluginID } from '@masknet/shared-base'
setupStorage(PersistentStorages.Plugin.createSubScope(PluginID.Trader, { transactions: {} }))
