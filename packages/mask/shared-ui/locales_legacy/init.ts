import { i18NextInstance } from '@masknet/shared-base'

// @ts-ignore to prevent TypeScript complains
import { addDashboardI18N } from '@masknet/dashboard'
import { addMaskI18N } from '../locales/languages'
import { addSharedI18N } from '@masknet/shared'

import { initReactI18next } from 'react-i18next'
import { addShareBaseI18N } from '@masknet/shared-base-ui'

initReactI18next.init(i18NextInstance)
addMaskI18N(i18NextInstance)
addSharedI18N(i18NextInstance)
addShareBaseI18N(i18NextInstance)
addDashboardI18N(i18NextInstance)
