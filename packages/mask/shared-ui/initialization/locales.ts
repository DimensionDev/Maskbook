import { initReactI18next } from 'react-i18next'
import { addSharedI18N } from '@masknet/shared'
import { i18NextInstance } from '@masknet/shared-base'
import { addShareBaseI18N } from '@masknet/shared-base-ui'

import { addMaskI18N } from '../locales/languages.js'
import { i18n } from '@lingui/core'

initReactI18next.init(i18NextInstance)
addMaskI18N(i18NextInstance, i18n)
addSharedI18N(i18NextInstance, i18n)
addShareBaseI18N(i18NextInstance, i18n)
i18n.activate('en')
