import { addSharedI18N } from '@masknet/shared'
import { addShareBaseI18N } from '@masknet/shared-base-ui'

import { addI18N } from '../locale/languages.js'
import { i18n } from '@lingui/core'

addI18N(i18n)
addSharedI18N(i18n)
addShareBaseI18N(i18n)
i18n.activate('en')
