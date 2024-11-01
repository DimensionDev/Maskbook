// TODO: Ad-hoc fix, if this appears multiple times in the codebase, consider bring our plugin infra back here.

import { i18n } from '@lingui/core'
import { linguiLanguages, setupStorage } from '@masknet/plugin-trader'
import { createI18NBundle, i18NextInstance, PersistentStorages, PluginID } from '@masknet/shared-base'

createI18NBundle('', linguiLanguages as any)(i18NextInstance, i18n)
setupStorage(PersistentStorages.Plugin.createSubScope(PluginID.Trader, { transactions: {} }))
