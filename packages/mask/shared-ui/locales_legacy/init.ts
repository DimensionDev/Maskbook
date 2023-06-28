import { i18NextInstance } from '@masknet/shared-base'
import { initReactI18next } from 'react-i18next'

import { addDashboardI18N } from './dashboard_init.js'
import { addMaskI18N } from '../locales/languages.js'
import { addSharedI18N } from '../../../shared/src/locales/languages.js'
import { addShareBaseI18N } from '../../../shared-base-ui/src/locales/languages.js'

initReactI18next.init(i18NextInstance)
addMaskI18N(i18NextInstance)
addSharedI18N(i18NextInstance)
addShareBaseI18N(i18NextInstance)
addDashboardI18N(i18NextInstance)
