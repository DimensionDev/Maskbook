// TODO: Ad-hoc fix, if this appears multiple times in the codebase, consider bring our plugin infra back here.

import { PersistentStorages } from '@masknet/shared-base'
import { setupStorage } from '../../../plugins/Trader/src/SiteAdaptor/storage.js'
setupStorage(PersistentStorages.Plugin.createSubScope('com.maskbook.trader', { transactions: {} }))
