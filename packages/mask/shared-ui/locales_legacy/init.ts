// @ts-ignore to prevent TypeScript complains
import { addDashboardI18N } from '@masknet/dashboard'
import { addSharedI18N } from '@masknet/shared'
import { addMaskI18N } from '../locales/languages.js'
import { addShareBaseI18N } from '@masknet/shared-base-ui'
import { i18NextInstance } from '@masknet/web3-shared-base'
import { initReactI18next } from 'react-i18next'

initReactI18next.init(i18NextInstance)
addMaskI18N(i18NextInstance)
addSharedI18N(i18NextInstance)
addShareBaseI18N(i18NextInstance)
addDashboardI18N(i18NextInstance)
