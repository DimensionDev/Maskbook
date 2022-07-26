import '../background/setup'
import './extension/service' // setup Services.*
import '../shared/native-rpc' // setup Android and iOS API server
import './extension/background-script/Jobs' // start jobs

// ! We should gradually stop using i18n in the background
import { addMaskI18N } from '../shared-ui/locales/languages'
import { i18NextInstance } from '@masknet/shared-base'
addMaskI18N(i18NextInstance)
