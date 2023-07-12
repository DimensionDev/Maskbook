import './storage.js'
import './telemetry-update.js'
import '../../shared-ui/locales_legacy/init.js'
import '../social-network-adaptor/index.js'

import { activateSocialNetworkUI } from '../social-network/define.js'
export const status = activateSocialNetworkUI()
