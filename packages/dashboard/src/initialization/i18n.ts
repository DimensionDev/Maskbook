import { i18NextInstance } from '@masknet/shared-base'
import { addSharedI18N } from '@masknet/shared'
import { addDashboardI18N } from '../locales/languages'
import { initReactI18next } from 'react-i18next'

initReactI18next.init(i18NextInstance)
addSharedI18N(i18NextInstance)
addDashboardI18N(i18NextInstance)
