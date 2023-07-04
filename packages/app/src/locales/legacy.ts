import { initReactI18next } from 'react-i18next'
import { addSharedI18N } from '@masknet/shared'
import { i18NextInstance } from '@masknet/shared-base'
import { addShareBaseI18N } from '@masknet/shared-base-ui'

initReactI18next.init(i18NextInstance)
addSharedI18N(i18NextInstance)
addShareBaseI18N(i18NextInstance)
