import { addSharedI18N } from '@masknet/shared'
import { addDashboardI18N } from '../locales/languages.js'
import { initReactI18next } from 'react-i18next'
import { i18NextInstance } from '@masknet/web3-shared-base'

initReactI18next.init(i18NextInstance)
addSharedI18N(i18NextInstance)
addDashboardI18N(i18NextInstance)
