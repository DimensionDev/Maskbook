import { i18NextInstance } from '@masknet/shared-base'
import { addSharedI18N } from '@masknet/shared'
import { addDashboardI18N } from '../locales/languages.js'
import { initReactI18next } from 'react-i18next'
import { i18n } from '@lingui/core'

initReactI18next.init(i18NextInstance)
addSharedI18N(i18NextInstance, i18n)
addDashboardI18N(i18NextInstance, i18n)
i18n.activate('en')
