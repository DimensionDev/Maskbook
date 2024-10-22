// TODO: Ad-hoc fix, if this appears multiple times in the codebase, consider bring our plugin infra back here.

import { createI18NBundle, i18NextInstance, PersistentStorages } from '@masknet/shared-base'
import { setupStorage } from '../../../plugins/Trader/src/SiteAdaptor/storage.js'
import { languages } from '../../../plugins/Trader/src/locale/languages.js'
import { i18n } from '@lingui/core'

createI18NBundle('', languages as any)(i18NextInstance, i18n)
setupStorage(PersistentStorages.Plugin.createSubScope('com.maskbook.trader', { transactions: {} }))
