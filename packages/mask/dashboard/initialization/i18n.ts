import { addSharedI18N } from '@masknet/shared'
import { addI18N } from '../../shared-ui/locale/languages.js'
import { i18n } from '@lingui/core'

addSharedI18N(i18n)
addI18N(i18n)
i18n.activate('en')
